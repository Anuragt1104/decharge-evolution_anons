use anchor_lang::prelude::*;

use crate::constants::{MAX_CITY_LEN, MAX_NAME_LEN, MAX_URI_LEN};

#[account]
pub struct PlatformConfig {
    pub admin: Pubkey,
    pub oracle: Pubkey,
    pub point_mint: Pubkey,
    pub bump: u8,
    pub point_rate_microunits: u64,
    pub payment_treasury: Pubkey,
    pub world_treasury: Pubkey,
}

impl PlatformConfig {
    pub const LEN: usize = 8 + (32 * 5) + 1 + 8;
}

#[account]
pub struct SessionCounter {
    pub next_session: u64,
}

impl SessionCounter {
    pub const LEN: usize = 8 + 8;
}

#[account]
pub struct ChargingStation {
    pub platform: Pubkey,
    pub operator: Pubkey,
    pub city: [u8; MAX_CITY_LEN],
    pub name: [u8; MAX_NAME_LEN],
    pub latitude_micro: i32,
    pub longitude_micro: i32,
    pub max_kw: u32,
    pub active: bool,
    pub pricing_energy_microunits: u64,
    pub pricing_time_microunits: u64,
    pub uri: [u8; MAX_URI_LEN],
    pub bump: u8,
}

impl ChargingStation {
    pub const LEN: usize = 8 + 32 + 32 + MAX_CITY_LEN + MAX_NAME_LEN + MAX_URI_LEN + 4 + 4 + 4 + 1 + 8 + 8 + 1;
}

#[account]
pub struct DriverProfile {
    pub driver: Pubkey,
    pub total_sessions: u64,
    pub total_energy_wh: u64,
    pub total_points_earned: u64,
    pub outstanding_points: u64,
    pub bump: u8,
}

impl DriverProfile {
    pub const LEN: usize = 8 + 32 + (8 * 4) + 1;
}

#[account]
pub struct ChargingSession {
    pub station: Pubkey,
    pub driver: Pubkey,
    pub session_counter: u64,
    pub energy_wh: u64,
    pub seconds_elapsed: u64,
    pub status: SessionStatus,
    pub price_microunits: u64,
    pub points_earned: u64,
    pub telemetry_hash: [u8; 32],
    pub opened_at: i64,
    pub closed_at: i64,
    pub bump: u8,
}

impl ChargingSession {
    pub const LEN: usize = 8 + 32 + 32 + (8 * 5) + SessionStatus::LEN + 32 + (8 * 2) + 1;
}

#[account]
pub struct PointsVault {
    pub driver: Pubkey,
    pub token_account: Pubkey,
    pub bump: u8,
}

impl PointsVault {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

#[account]
pub struct WorldPlot {
    pub owner: Pubkey,
    pub region_key: [u8; MAX_NAME_LEN],
    pub slot_capacity: u32,
    pub upgrade_level: u8,
    pub last_reward_time: i64,
    pub bump: u8,
}

impl WorldPlot {
    pub const LEN: usize = 8 + 32 + MAX_NAME_LEN + 4 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum SessionStatus {
    #[default]
    Active,
    Closed,
}

impl SessionStatus {
    pub const LEN: usize = 1;
}

pub fn fit_to_array<const N: usize>(input: &str) -> [u8; N] {
    let mut buffer = [0u8; N];
    let bytes = input.as_bytes();
    let copy_len = bytes.len().min(N);
    buffer[..copy_len].copy_from_slice(&bytes[..copy_len]);
    buffer
}
