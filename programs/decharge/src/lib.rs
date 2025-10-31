#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("DeChrg11111111111111111111111111111111111111");

#[program]
pub mod decharge {
    use super::*;

    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        args: InitializePlatformArgs,
    ) -> Result<()> {
        instructions::initialize_platform(ctx, args)
    }

    pub fn register_station(
        ctx: Context<RegisterStation>,
        args: RegisterStationArgs,
    ) -> Result<()> {
        instructions::register_station(ctx, args)
    }

    pub fn start_session(
        ctx: Context<StartSession>,
        args: StartSessionArgs,
    ) -> Result<()> {
        instructions::start_session(ctx, args)
    }

    pub fn record_telemetry(
        ctx: Context<RecordTelemetry>,
        args: TelemetryArgs,
    ) -> Result<()> {
        instructions::record_telemetry(ctx, args)
    }

    pub fn close_session(
        ctx: Context<CloseSession>,
        args: CloseSessionArgs,
    ) -> Result<()> {
        instructions::close_session(ctx, args)
    }

    pub fn purchase_points(
        ctx: Context<PurchasePoints>,
        args: PurchasePointsArgs,
    ) -> Result<()> {
        instructions::purchase_points(ctx, args)
    }

    pub fn claim_world_plot(
        ctx: Context<ClaimWorldPlot>,
        region_key: [u8; 64],
    ) -> Result<()> {
        instructions::claim_world_plot(ctx, region_key)
    }
}
