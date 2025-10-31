#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::constants::*;
use crate::errors::DechargeError;
use crate::events::{PlotClaimed, PointsPurchased, SessionClosed, SessionStarted, StationRegistered};
use crate::state::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

pub fn initialize_platform(
    ctx: Context<InitializePlatform>,
    args: InitializePlatformArgs,
) -> Result<()> {
    let config = &mut ctx.accounts.platform_config;
    config.admin = ctx.accounts.admin.key();
    config.oracle = args.oracle;
    config.point_mint = ctx.accounts.point_mint.key();
    config.bump = ctx.bumps.platform_config;
    config.point_rate_microunits = args.point_rate_microunits;
    config.payment_treasury = ctx.accounts.payment_treasury.key();
    config.world_treasury = ctx.accounts.world_treasury.key();

    ctx.accounts.session_counter.next_session = 0;

    Ok(())
}

pub fn register_station(
    ctx: Context<RegisterStation>,
    args: RegisterStationArgs,
) -> Result<()> {
    require!(args.name.len() <= MAX_NAME_LEN, DechargeError::DataTooLong);
    require!(args.city.len() <= MAX_CITY_LEN, DechargeError::DataTooLong);
    require!(args.uri.len() <= MAX_URI_LEN, DechargeError::DataTooLong);

    let station = &mut ctx.accounts.station;
    station.platform = ctx.accounts.platform_config.key();
    station.operator = ctx.accounts.admin.key();
    station.city = fit_to_array::<MAX_CITY_LEN>(&args.city);
    station.name = fit_to_array::<MAX_NAME_LEN>(&args.name);
    station.latitude_micro = args.location_lat_micro;
    station.longitude_micro = args.location_lon_micro;
    station.max_kw = args.max_kw;
    station.active = true;
    station.pricing_energy_microunits = args.pricing_energy_microunits;
    station.pricing_time_microunits = args.pricing_time_microunits;
    station.uri = fit_to_array::<MAX_URI_LEN>(&args.uri);
    station.bump = ctx.bumps.station;

    emit!(StationRegistered {
        station: station.key(),
        operator: station.operator,
        city: args.city,
    });

    Ok(())
}

pub fn start_session(
    ctx: Context<StartSession>,
    args: StartSessionArgs,
) -> Result<()> {
    require!(ctx.accounts.station.active, DechargeError::StationInactive);

    let session_index = ctx.accounts.session_counter.next_session;
    let driver_key = ctx.accounts.driver.key();

    let driver_profile = &mut ctx.accounts.driver_profile;
    if driver_profile.driver == Pubkey::default() {
        driver_profile.driver = driver_key;
        driver_profile.bump = ctx.bumps.driver_profile;
    } else {
        require!(driver_profile.driver == driver_key, DechargeError::Unauthorized);
    }

    let session = &mut ctx.accounts.session;
    session.station = ctx.accounts.station.key();
    session.driver = driver_profile.driver;
    session.session_counter = session_index;
    session.energy_wh = 0;
    session.seconds_elapsed = 0;
    session.status = SessionStatus::Active;
    session.price_microunits = 0;
    session.points_earned = 0;
    session.telemetry_hash = args.session_hash;
    session.opened_at = args.timestamp;
    session.closed_at = 0;
    session.bump = ctx.bumps.session;

    ctx.accounts.session_counter.next_session = session_index
        .checked_add(1)
        .ok_or(DechargeError::NumericalOverflow)?;

    emit!(SessionStarted {
        session: session.key(),
        station: session.station,
        driver: session.driver,
        timestamp: args.timestamp,
    });

    Ok(())
}

pub fn record_telemetry(
    ctx: Context<RecordTelemetry>,
    args: TelemetryArgs,
) -> Result<()> {
    let session = &mut ctx.accounts.session;
    require!(session.status == SessionStatus::Active, DechargeError::SessionClosed);

    session.energy_wh = session
        .energy_wh
        .checked_add(args.energy_delta_wh)
        .ok_or(DechargeError::NumericalOverflow)?;
    session.seconds_elapsed = session
        .seconds_elapsed
        .checked_add(args.seconds_delta)
        .ok_or(DechargeError::NumericalOverflow)?;
    session.telemetry_hash = args.telemetry_hash;

    Ok(())
}

pub fn close_session(
    ctx: Context<CloseSession>,
    args: CloseSessionArgs,
) -> Result<()> {
    let session = &mut ctx.accounts.session;
    require!(session.status == SessionStatus::Active, DechargeError::SessionClosed);

    let station = &ctx.accounts.station;
    let config = &ctx.accounts.platform_config;

    session.energy_wh = args.final_energy_wh;
    session.seconds_elapsed = args.final_seconds;
    session.telemetry_hash = args.telemetry_hash;
    session.closed_at = args.closed_at;
    session.status = SessionStatus::Closed;

    let energy_component = args
        .final_energy_wh
        .checked_mul(station.pricing_energy_microunits)
        .ok_or(DechargeError::NumericalOverflow)?;
    let time_component = args
        .final_seconds
        .checked_mul(station.pricing_time_microunits)
        .ok_or(DechargeError::NumericalOverflow)?;
    let total_price = energy_component
        .checked_add(time_component)
        .ok_or(DechargeError::NumericalOverflow)?;
    session.price_microunits = total_price;

    let points_micros = args
        .final_energy_wh
        .checked_mul(config.point_rate_microunits)
        .ok_or(DechargeError::NumericalOverflow)?;
    let points_to_mint = points_micros
        .checked_div(MICROS_PER_POINT)
        .ok_or(DechargeError::NumericalOverflow)?;
    session.points_earned = points_to_mint;

    let driver_profile = &mut ctx.accounts.driver_profile;
    driver_profile.total_sessions = driver_profile
        .total_sessions
        .checked_add(1)
        .ok_or(DechargeError::NumericalOverflow)?;
    driver_profile.total_energy_wh = driver_profile
        .total_energy_wh
        .checked_add(args.final_energy_wh)
        .ok_or(DechargeError::NumericalOverflow)?;
    driver_profile.total_points_earned = driver_profile
        .total_points_earned
        .checked_add(points_to_mint)
        .ok_or(DechargeError::NumericalOverflow)?;
    driver_profile.outstanding_points = driver_profile
        .outstanding_points
        .checked_add(points_to_mint)
        .ok_or(DechargeError::NumericalOverflow)?;

    let points_vault = &mut ctx.accounts.points_vault;
    if points_vault.driver == Pubkey::default() {
        points_vault.driver = driver_profile.driver;
        points_vault.token_account = ctx.accounts.vault_token_account.key();
        points_vault.bump = ctx.bumps.points_vault;
    } else {
        require!(
            points_vault.driver == driver_profile.driver,
            DechargeError::PointsVaultMismatch
        );
        require!(
            points_vault.token_account == ctx.accounts.vault_token_account.key(),
            DechargeError::PointsVaultMismatch
        );
    }

    let mint_seeds: &[&[u8]] = &[PLATFORM_SEED, &[config.bump]];
    let signer_seeds = &[mint_seeds];
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.point_mint.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.platform_config.to_account_info(),
        },
        signer_seeds,
    );

    if points_to_mint > 0 {
        token::mint_to(mint_ctx, points_to_mint)?;
    }

    emit!(SessionClosed {
        session: session.key(),
        energy_wh: args.final_energy_wh,
        seconds: args.final_seconds,
        points_minted: points_to_mint,
    });

    Ok(())
}

pub fn purchase_points(
    ctx: Context<PurchasePoints>,
    args: PurchasePointsArgs,
) -> Result<()> {
    require!(
        ctx.accounts.driver_profile.outstanding_points >= args.amount,
        DechargeError::InsufficientPoints
    );

    let transfer_ix = system_instruction::transfer(
        &ctx.accounts.buyer.key(),
        &ctx.accounts.payment_treasury.key(),
        args.price_lamports,
    );

    invoke(
        &transfer_ix,
        &[ 
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.payment_treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    let vault_seeds: &[&[u8]] = &[
        POINTS_VAULT_SEED,
        ctx.accounts.driver_profile.driver.as_ref(),
        &[ctx.accounts.points_vault.bump],
    ];
    let signer_seeds = &[vault_seeds];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.points_vault.to_account_info(),
        },
        signer_seeds,
    );

    token::transfer(transfer_ctx, args.amount)?;

    ctx.accounts.driver_profile.outstanding_points = ctx
        .accounts
        .driver_profile
        .outstanding_points
        .checked_sub(args.amount)
        .ok_or(DechargeError::NumericalOverflow)?;

    emit!(PointsPurchased {
        buyer: ctx.accounts.buyer.key(),
        driver: ctx.accounts.driver_profile.driver,
        amount: args.amount,
        price_lamports: args.price_lamports,
    });

    Ok(())
}

pub fn claim_world_plot(
    ctx: Context<ClaimWorldPlot>,
    region_key: [u8; 64],
) -> Result<()> {
    let plot = &mut ctx.accounts.plot;
    plot.owner = ctx.accounts.claimant.key();
    plot.region_key = region_key;
    plot.slot_capacity = 1;
    plot.upgrade_level = 1;
    plot.last_reward_time = Clock::get()?.unix_timestamp;
    plot.bump = ctx.bumps.plot;

    emit!(PlotClaimed {
        plot: plot.key(),
        owner: plot.owner,
        region: String::from_utf8_lossy(&region_key).trim_end_matches('\0').to_string(),
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: InitializePlatformArgs)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [PLATFORM_SEED],
        bump,
        space = PlatformConfig::LEN,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(
        init,
        payer = admin,
        seeds = [SESSION_COUNTER_SEED],
        bump,
        space = SessionCounter::LEN,
    )]
    pub session_counter: Account<'info, SessionCounter>,
    #[account(
        init,
        payer = admin,
        mint::decimals = DEFAULT_POINTS_DECIMALS,
        mint::authority = platform_config,
        mint::freeze_authority = platform_config,
    )]
    pub point_mint: Account<'info, Mint>,
    /// Treasury account where SOL/USDC payments are routed
    #[account(mut)]
    pub payment_treasury: SystemAccount<'info>,
    /// Treasury for world rewards
    #[account(mut)]
    pub world_treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializePlatformArgs {
    pub oracle: Pubkey,
    pub point_rate_microunits: u64,
}

#[derive(Accounts)]
#[instruction(args: RegisterStationArgs)]
pub struct RegisterStation<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_config.bump,
        has_one = admin @ DechargeError::Unauthorized,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(
        init,
        payer = admin,
        seeds = [
            STATION_SEED,
            args.station_code.as_bytes(),
        ],
        bump,
        space = ChargingStation::LEN,
    )]
    pub station: Account<'info, ChargingStation>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RegisterStationArgs {
    pub station_code: String,
    pub name: String,
    pub city: String,
    pub location_lat_micro: i32,
    pub location_lon_micro: i32,
    pub max_kw: u32,
    pub pricing_energy_microunits: u64,
    pub pricing_time_microunits: u64,
    pub uri: String,
}

#[derive(Accounts)]
pub struct StartSession<'info> {
    #[account(mut)]
    pub oracle: Signer<'info>,
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_config.bump,
        has_one = oracle @ DechargeError::Unauthorized,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub session_counter: Account<'info, SessionCounter>,
    #[account(mut)]
    pub station: Account<'info, ChargingStation>,
    /// CHECK: validated via CPI or off-chain oracle signature
    pub driver: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = oracle,
        seeds = [DRIVER_PROFILE_SEED, driver.key().as_ref()],
        bump,
        space = DriverProfile::LEN,
    )]
    pub driver_profile: Account<'info, DriverProfile>,
    #[account(
        init,
        payer = oracle,
        seeds = [SESSION_SEED, session_counter.next_session.to_le_bytes().as_ref()],
        bump,
        space = ChargingSession::LEN,
    )]
    pub session: Account<'info, ChargingSession>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StartSessionArgs {
    pub session_hash: [u8; 32],
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct RecordTelemetry<'info> {
    #[account(mut)]
    pub oracle: Signer<'info>,
    #[account(
        seeds = [PLATFORM_SEED],
        bump = platform_config.bump,
        has_one = oracle @ DechargeError::Unauthorized,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut)]
    pub session: Account<'info, ChargingSession>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TelemetryArgs {
    pub energy_delta_wh: u64,
    pub seconds_delta: u64,
    pub telemetry_hash: [u8; 32],
}

#[derive(Accounts)]
pub struct CloseSession<'info> {
    #[account(mut)]
    pub oracle: Signer<'info>,
    #[account(
        seeds = [PLATFORM_SEED],
        bump = platform_config.bump,
        has_one = oracle @ DechargeError::Unauthorized,
    )]
    pub platform_config: Box<Account<'info, PlatformConfig>>,
    #[account(mut)]
    pub session: Box<Account<'info, ChargingSession>>,
    #[account(mut)]
    pub driver_profile: Box<Account<'info, DriverProfile>>,
    #[account(mut)]
    pub station: Box<Account<'info, ChargingStation>>,
    #[account(
        init_if_needed,
        payer = oracle,
        seeds = [POINTS_VAULT_SEED, driver_profile.driver.as_ref()],
        bump,
        space = PointsVault::LEN,
    )]
    pub points_vault: Box<Account<'info, PointsVault>>,
    #[account(
        init_if_needed,
        payer = oracle,
        associated_token::mint = point_mint,
        associated_token::authority = points_vault,
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
    pub point_mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CloseSessionArgs {
    pub final_energy_wh: u64,
    pub final_seconds: u64,
    pub telemetry_hash: [u8; 32],
    pub closed_at: i64,
}

#[derive(Accounts)]
pub struct PurchasePoints<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub driver_profile: Account<'info, DriverProfile>,
    #[account(
        mut,
        seeds = [POINTS_VAULT_SEED, driver_profile.driver.as_ref()],
        bump = points_vault.bump,
    )]
    pub points_vault: Account<'info, PointsVault>,
    #[account(
        mut,
        address = points_vault.token_account,
        token::mint = point_mint,
        token::authority = points_vault,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = point_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub point_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [PLATFORM_SEED],
        bump = platform_config.bump,
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, address = platform_config.payment_treasury)]
    pub payment_treasury: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PurchasePointsArgs {
    pub amount: u64,
    pub price_lamports: u64,
}

#[derive(Accounts)]
#[instruction(region_key: [u8; 64])]
pub struct ClaimWorldPlot<'info> {
    #[account(mut)]
    pub claimant: Signer<'info>,
    #[account(
        init,
        payer = claimant,
        seeds = [WORLD_PLOT_SEED, region_key.as_ref()],
        bump,
        space = WorldPlot::LEN,
    )]
    pub plot: Account<'info, WorldPlot>,
    pub system_program: Program<'info, System>,
}
