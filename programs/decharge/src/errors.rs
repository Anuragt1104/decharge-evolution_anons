use anchor_lang::prelude::*;

#[error_code]
pub enum DechargeError {
    #[msg("Unauthorized signer for this instruction")] 
    Unauthorized,
    #[msg("Charging station already registered")] 
    StationAlreadyExists,
    #[msg("Charging station not active")] 
    StationInactive,
    #[msg("Charging session already closed")] 
    SessionClosed,
    #[msg("Charging session still active")] 
    SessionActive,
    #[msg("Invalid telemetry payload")] 
    InvalidTelemetry,
    #[msg("Insufficient points available for transfer")] 
    InsufficientPoints,
    #[msg("Points vault does not match driver account")] 
    PointsVaultMismatch,
    #[msg("Provided string data exceeds maximum length")] 
    DataTooLong,
    #[msg("Virtual plot is already occupied")] 
    PlotOccupied,
    #[msg("Numerical overflow detected")] 
    NumericalOverflow,
}
