import web3 from './web3'
import CampaignFactory from './build/CampaignFactory.json'
const campaignFactoryAddress = '0x0152e3F00eFE9eB313328E9D14f08Dc7B4416D38'

const factory = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    campaignFactoryAddress
)

export default factory
