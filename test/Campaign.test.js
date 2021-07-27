const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const compiledFactory = require('../etherum/build/CampaignFactory.json')
const compiledCampaign = require('../etherum/build/Campaign.json')

describe('Campaigns', () => {
    const gasLimit = '1000000'
    const minContribution = 100
    const FIRST_REQUEST = 0
    let accounts
    let factory
    let campaingAddress
    let campaign
    let requestTemplate

    let OWNER, MANAGER, CONTRIBUTOR_1, CONTRIBUTOR_2

    beforeEach(async () => {
        // Deploy the factory into the blockchain
        accounts = await web3.eth.getAccounts()
        OWNER = accounts[0]
        MANAGER = accounts[1]
        CONTRIBUTOR_1 = accounts[2]
        CONTRIBUTOR_2 = accounts[3]
        requestTemplate = {
            description: 'Buy batteries',
            value: '500',
            recipient: accounts[4]
        }
        factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
            .deploy({ data: compiledFactory.bytecode})
            .send({
                from: OWNER, 
                gas: gasLimit
            })

        // Use the factory to create one Campaign
        await factory.methods.createCampaign(minContribution).send({
            from: MANAGER, 
            gas: gasLimit
        })

        // Save data about the first campaign
        const campaigns = await factory.methods.getDeployedCampaigns().call()
        campaingAddress = campaigns[0]
        campaign = await new web3.eth.Contract(
            JSON.parse(compiledCampaign.interface), 
            campaingAddress
        )        
    })

    it('Factory and a Campaing must be deployed successfully', async () => {                
        assert.ok(factory.options.address)
        assert.ok(campaign.options.address)
    })

    it('Campaign manager must be the one who request the creation', async () => {
        const contractManager = await campaign.methods.manager().call()
        assert.strictEqual(contractManager, MANAGER)
    })

    it('Campaign must contain the minimumContribution value', async () => {
        const minValue = await campaign.methods.minContribution().call()
        assert.strictEqual(minValue, minContribution.toString())
    })

    it('Must allow people to contribute and mark them as contributors', async () => {
        let contribution = minContribution
        await contribute(contribution, CONTRIBUTOR_1)
        
        const isContributor = await campaign.methods.contributors(CONTRIBUTOR_1).call()
        const balance = await web3.eth.getBalance(campaingAddress)
        const contributorsCount = await campaign.methods.contributorsCount().call()

        assert.strictEqual(balance, contribution.toString())
        assert.strictEqual(contributorsCount, '1')
        assert(isContributor, true)
    })

    it('Must not allow user to contribute without minimum value', async () => {
        let contribution = minContribution * 0.99
        try {            
            await contribute(contribution, CONTRIBUTOR_1)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it('Must allow manager to make a request', async () => {       
        await makeRequest(requestTemplate, MANAGER)
        const req = await campaign.methods.requests(0).call()

        assert.strictEqual(req.description, requestTemplate.description)
        assert.strictEqual(req.value, requestTemplate.value.toString())
        assert.strictEqual(req.recipient, requestTemplate.recipient)
        assert.strictEqual(req.complete, false)
        assert.strictEqual(req.approvalCount, '0')       
    })

    it('Must not allow non-manager to make a request', async () => {
        try {   
            await makeRequest(requestTemplate, CONTRIBUTOR_1)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it("Manager must not approve the request", async () => {
        await makeRequest(requestTemplate, MANAGER)
        try {
            await approveRequest(FIRST_REQUEST, MANAGER)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it("Non contributor must not approve the request", async () => {
        await makeRequest(requestTemplate, MANAGER)
        try {
            await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it("Contributor must approve the request", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(minContribution, CONTRIBUTOR_1)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)

        const req = await campaign.methods.requests(0).call()
        assert.strictEqual(req.approvalCount, '1')
    })

    it("Contributor must not approve the request more than once", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(minContribution, CONTRIBUTOR_1)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)
        try {
            await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it("Non manager must not finalize the request", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(requestTemplate.value , CONTRIBUTOR_1)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)
        try {
            await finalizeRequest(FIRST_REQUEST, CONTRIBUTOR_1)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }
    })

    it("Manager must finalize the request", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(requestTemplate.value , CONTRIBUTOR_1)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)     

        // Get recipient's balance before and after the transaction
        let oldRecipientBalance = await web3.eth.getBalance(requestTemplate.recipient)
        await finalizeRequest(FIRST_REQUEST, MANAGER)
        let newRecipientBalance = await web3.eth.getBalance(requestTemplate.recipient)
        newRecipientBalance = BigInt(newRecipientBalance)

        const recipientProfit = BigInt(newRecipientBalance) - BigInt(oldRecipientBalance)
        const campaingBalance = await web3.eth.getBalance(campaingAddress)
        const req = await campaign.methods.requests(FIRST_REQUEST).call()

        assert.strictEqual(campaingBalance, '0')
        assert.strictEqual(req.complete, true)        
        assert.strictEqual(recipientProfit.toString(), requestTemplate.value)
          
    })

    it("Manager must not finalize the request more than once", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(requestTemplate.value , CONTRIBUTOR_1)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)            
        await finalizeRequest(FIRST_REQUEST, MANAGER)
        try {
            await finalizeRequest(FIRST_REQUEST, MANAGER)
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }   
    })

    it("Manager must not finalize the request without enough approvers", async () => {
        await makeRequest(requestTemplate, MANAGER)
        await contribute(requestTemplate.value , CONTRIBUTOR_1)
        await contribute(requestTemplate.value , CONTRIBUTOR_2)
        await approveRequest(FIRST_REQUEST, CONTRIBUTOR_1)
        try {
            await finalizeRequest(FIRST_REQUEST, MANAGER) 
            assert(false)
        } catch (err) {
            assert.strictEqual(err.results[err.hashes].error, 'revert')
        }   
    })

    const contribute = async (value, contributor) => {
        await campaign.methods.contribute().send({
            from: contributor,
            value: value
        })
    }

    const makeRequest = async (req, requestor) => {
        await campaign.methods.createRequest(req.description, req.value, req.recipient).send({
            from: requestor,
            gas: gasLimit
        })
    }
    
    const approveRequest = async (index, requestor) => {
        await campaign.methods.approveRequest(index).send({
            from: requestor,
            gas: gasLimit
        })
    }

    const finalizeRequest = async (index, requestor) => {
        await campaign.methods.finalizeRequest(index).send({
            from: requestor,
            gas: gasLimit
        })
    }    
})