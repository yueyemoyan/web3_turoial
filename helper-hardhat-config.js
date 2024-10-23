const DECIMAAL = 8
const INITIAL_ANSWER = 300000000000
const developmentChains = ["hardhat", "local"]
const LOCK_TIME = 180
const Confirmations = 5
const networkConfig = {
    11155111: {
        ethUsdDataFeed: ""
    },
    97: {
        ethUsdDataFeed: ""
    }
}

module.exports = {
    DECIMAAL,
    INITIAL_ANSWER,
    developmentChains,
    LOCK_TIME,
    networkConfig,
    Confirmations
}