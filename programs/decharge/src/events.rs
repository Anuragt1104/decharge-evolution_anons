use anchor_lang::prelude::*;

#[event]
pub struct StationRegistered {
    pub station: Pubkey,
    pub operator: Pubkey,
    pub city: String,
}

#[event]
pub struct SessionStarted {
    pub session: Pubkey,
    pub station: Pubkey,
    pub driver: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SessionClosed {
    pub session: Pubkey,
    pub energy_wh: u64,
    pub seconds: u64,
    pub points_minted: u64,
}

#[event]
pub struct PointsPurchased {
    pub buyer: Pubkey,
    pub driver: Pubkey,
    pub amount: u64,
    pub price_lamports: u64,
}

#[event]
pub struct PlotClaimed {
    pub plot: Pubkey,
    pub owner: Pubkey,
    pub region: String,
}
