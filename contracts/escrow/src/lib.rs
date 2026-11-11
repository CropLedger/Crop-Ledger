//! CropLedger Escrow Contract
//!
//! A Soroban smart contract that holds funds in escrow for a
//! crop trade, releasing them to the seller upon confirmed delivery
//! or refunding the buyer if cancelled before the deadline.
//!
//! # State machine
//!
//! ```text
//!   PENDING ──deposit()──▶ FUNDED
//!   FUNDED  ──deliver()──▶ RELEASED  (seller claims)
//!   FUNDED  ──refund()───▶ REFUNDED  (buyer reclaims, only before deadline)
//! ```
//!
//! # Compile & deploy (Testnet)
//!
//! ```bash
//! rustup target add wasm32-unknown-unknown
//! cargo build --target wasm32-unknown-unknown --release
//!
//! stellar contract deploy \
//!   --wasm target/wasm32-unknown-unknown/release/cropledger_escrow.wasm \
//!   --source <DEPLOYER_SECRET_KEY> \
//!   --network testnet
//! ```

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, token,
};

// ─── Storage keys ────────────────────────────────────────────────────────────

const BUYER: Symbol      = symbol_short!("BUYER");
const SELLER: Symbol     = symbol_short!("SELLER");
const TOKEN: Symbol      = symbol_short!("TOKEN");
const AMOUNT: Symbol     = symbol_short!("AMOUNT");
const DEADLINE: Symbol   = symbol_short!("DEADLINE");
const STATUS: Symbol     = symbol_short!("STATUS");

// ─── Status enum ─────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum EscrowStatus {
    Pending,
    Funded,
    Released,
    Refunded,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialise the escrow. Must be called once by the deployer.
    ///
    /// * `buyer`    – address that deposits and can reclaim before deadline
    /// * `seller`   – address that claims after delivery confirmation
    /// * `token`    – SAC address of the payment token (use XLM wrapper or a custom token)
    /// * `amount`   – amount in stroops (1 XLM = 10_000_000 stroops)
    /// * `deadline` – Unix timestamp after which the buyer cannot refund
    pub fn init(
        env: Env,
        buyer: Address,
        seller: Address,
        token: Address,
        amount: i128,
        deadline: u64,
    ) {
        // Prevent re-initialisation
        if env.storage().instance().has(&STATUS) {
            panic!("already initialised");
        }
        env.storage().instance().set(&BUYER,    &buyer);
        env.storage().instance().set(&SELLER,   &seller);
        env.storage().instance().set(&TOKEN,    &token);
        env.storage().instance().set(&AMOUNT,   &amount);
        env.storage().instance().set(&DEADLINE, &deadline);
        env.storage().instance().set(&STATUS,   &EscrowStatus::Pending);
    }

    /// Deposit the agreed amount. Must be called by the buyer.
    pub fn deposit(env: Env) {
        let status: EscrowStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == EscrowStatus::Pending, "not in PENDING state");

        let buyer: Address = env.storage().instance().get(&BUYER).unwrap();
        buyer.require_auth();

        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let amount: i128        = env.storage().instance().get(&AMOUNT).unwrap();

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        env.storage().instance().set(&STATUS, &EscrowStatus::Funded);
    }

    /// Mark delivery confirmed and release funds to the seller.
    /// Only the buyer (or an authorised inspector) can call this.
    pub fn deliver(env: Env) {
        let status: EscrowStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == EscrowStatus::Funded, "not in FUNDED state");

        let buyer: Address  = env.storage().instance().get(&BUYER).unwrap();
        let seller: Address = env.storage().instance().get(&SELLER).unwrap();
        buyer.require_auth();

        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let amount: i128        = env.storage().instance().get(&AMOUNT).unwrap();

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &seller, &amount);

        env.storage().instance().set(&STATUS, &EscrowStatus::Released);
    }

    /// Refund the buyer. Only callable by the buyer before the deadline.
    pub fn refund(env: Env) {
        let status: EscrowStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == EscrowStatus::Funded, "not in FUNDED state");

        let deadline: u64 = env.storage().instance().get(&DEADLINE).unwrap();
        let now = env.ledger().timestamp();
        assert!(now < deadline, "deadline passed — cannot refund");

        let buyer: Address = env.storage().instance().get(&BUYER).unwrap();
        buyer.require_auth();

        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let amount: i128        = env.storage().instance().get(&AMOUNT).unwrap();

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &buyer, &amount);

        env.storage().instance().set(&STATUS, &EscrowStatus::Refunded);
    }

    /// Read the current status without modifying state.
    pub fn status(env: Env) -> EscrowStatus {
        env.storage().instance().get(&STATUS).unwrap_or(EscrowStatus::Pending)
    }

    /// Return the agreed amount.
    pub fn amount(env: Env) -> i128 {
        env.storage().instance().get(&AMOUNT).unwrap_or(0)
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, token, Env};

    fn create_token(env: &Env, admin: &Address) -> (Address, token::Client) {
        let token_id = env.register_stellar_asset_contract(admin.clone());
        let client   = token::Client::new(env, &token_id);
        (token_id, client)
    }

    #[test]
    fn test_deposit_and_deliver() {
        let env     = Env::default();
        let buyer   = Address::generate(&env);
        let seller  = Address::generate(&env);
        let (token_id, token_client) = create_token(&env, &buyer);

        // Mint 1000 to buyer
        let admin_client = token::StellarAssetClient::new(&env, &token_id);
        admin_client.mint(&buyer, &1_000);

        let contract_id = env.register_contract(None, EscrowContract);
        let escrow = EscrowContractClient::new(&env, &contract_id);

        let deadline = env.ledger().timestamp() + 86_400;
        escrow.init(&buyer, &seller, &token_id, &500, &deadline);

        env.mock_all_auths();
        escrow.deposit();
        assert_eq!(escrow.status(), EscrowStatus::Funded);
        assert_eq!(token_client.balance(&contract_id), 500);

        escrow.deliver();
        assert_eq!(escrow.status(), EscrowStatus::Released);
        assert_eq!(token_client.balance(&seller), 500);
    }

    #[test]
    fn test_refund_before_deadline() {
        let env     = Env::default();
        let buyer   = Address::generate(&env);
        let seller  = Address::generate(&env);
        let (token_id, token_client) = create_token(&env, &buyer);

        let admin_client = token::StellarAssetClient::new(&env, &token_id);
        admin_client.mint(&buyer, &1_000);

        let contract_id = env.register_contract(None, EscrowContract);
        let escrow = EscrowContractClient::new(&env, &contract_id);

        let deadline = env.ledger().timestamp() + 86_400;
        escrow.init(&buyer, &seller, &token_id, &300, &deadline);

        env.mock_all_auths();
        escrow.deposit();
        escrow.refund();

        assert_eq!(escrow.status(), EscrowStatus::Refunded);
        assert_eq!(token_client.balance(&buyer), 1_000); // all money back
    }
}
