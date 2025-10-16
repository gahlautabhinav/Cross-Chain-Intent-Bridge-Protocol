#![no_std]
use soroban_sdk::{contract, contractimpl, contractevent, Env, String, Map, Address, Symbol};

#[contract]
pub struct IntentLiquidityDemo;

#[contractevent]
pub struct IntentRecorded {
    pub user: Address,
    pub intent_id: String,
    pub details: String,
}

#[contractevent]
pub struct LiquidityAdded {
    pub user: Address,
    pub tx_hash: String,
    pub amount: i128,
}

#[contractimpl]
impl IntentLiquidityDemo {
    pub fn record_intent(env: Env, user: Address, intent_id: String, details: String) {
        let key = Symbol::new(&env, "intent");
        let mut store: Map<String, String> = env.storage().instance().get(&key).unwrap_or(Map::new(&env));
        store.set(intent_id.clone(), details.clone());
        env.storage().instance().set(&key, &store);

        // ✅ new-style event
        IntentRecorded { user, intent_id, details }.publish(&env);
    }

    pub fn record_liquidity(env: Env, user: Address, tx_hash: String, amount: i128) {
        let key = Symbol::new(&env, "liquidity");
        let mut store: Map<String, i128> = env.storage().instance().get(&key).unwrap_or(Map::new(&env));
        store.set(tx_hash.clone(), amount);
        env.storage().instance().set(&key, &store);

        // ✅ new-style event
        LiquidityAdded { user, tx_hash, amount }.publish(&env);
    }
}
