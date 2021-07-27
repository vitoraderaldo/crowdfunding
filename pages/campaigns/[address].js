import React, { Component } from "react";
import { Card, Grid, Button } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Campaign from '../../etherum/campaign'
import web3 from '../../etherum/web3'
import ContributeForm from '../../components/ContributeForm';
import Link from 'next/link'

class CampaignShow extends Component {

    static async getInitialProps(props) {
        const address = props.query.address
        const campaing = Campaign(address)
        const summary = await campaing.methods.getSummary().call()        
        return {
            address: address,
            minContribution: summary[0],  
            balance: summary[1], 
            requestsCount: summary[2], 
            contributorsCount: summary[3],
            manager: summary[4]
        }
    }

    renderCards() {
        const {minContribution, balance, requestsCount, contributorsCount, manager} = this.props
        const items = [
            {
                header: manager,
                meta: "Manager's address",
                description: 'The manager created this campaign and can create request to withdraw money',
                style: {
                    overflowWrap: 'break-word'
                }
            },
            {
                header: minContribution,
                meta: 'Minimum Contribution',
                description: 'You must contribute at least this much wei to become an approver'
            },
            {
                header: requestsCount,
                meta: 'Number of requests',
                description: 'A request tries to withdraw money from the contract. Request mus be approved by contributors'
            },
            {
                header: contributorsCount,
                meta: 'Number of contributors',
                description: 'Number of people who have already donated to this campaign'
            },
            {
                header: web3.utils.fromWei(balance, 'ether'),
                meta: 'Campaign Balance (ether)',
                description: 'The balance is how much money this campaign has left to spend.'
            }
        ]        
        return <Card.Group items={items} />
    }
    
    render() {
        return (
            <Layout>
                <Link href={`/`}>Back</Link> 
                <h3>Campaing Details</h3>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            {this.renderCards()}                            
                        </Grid.Column>
                        <Grid.Column width={6}>                        
                            <ContributeForm address={this.props.address} />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Link href={`/campaigns/${this.props.address}/requests`}>
                                <Button primary>View Requests</Button>
                            </Link>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>             
            </Layout>
        )
    }
}

export default CampaignShow