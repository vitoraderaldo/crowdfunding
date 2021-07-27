import React, { Component } from 'react'
import { Card, Button } from 'semantic-ui-react'
import factory from '../etherum/factory'
import Layout from '../components/Layout'
import Link from 'next/link'

class CampaignIndex extends Component {

    static async getInitialProps() {
        const campaings = await factory.methods.getDeployedCampaigns().call()
        return {campaings: campaings}
    }

    renderCampaigns() {
        const items = this.props.campaings.map(address => {
            return {
                header: address,
                description: <Link href={`/campaigns/${address}`}>View Campaign</Link>,
                fluid: true
            }
        })
        return <Card.Group items={items} />
    }

    render() {
        return (
            <Layout>
                <div>                    
                    <h3>Open Campaigns</h3>

                    <Link href="campaigns/new">
                        <Button 
                            floated = "right"
                            content = "Create Campaign"
                            icon = "add circle"
                            primary
                        />
                    </Link>                
                    {this.renderCampaigns()}
                </div>
            </Layout>
        )
    }
}

export default CampaignIndex
