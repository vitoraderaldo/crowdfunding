import React, { Component } from 'react'
import Layout from '../../../../components/Layout'
import Campaign from '../../../../etherum/campaign'
import { Button, Table } from 'semantic-ui-react'
import Link from 'next/link'
import RequestRow from '../../../../components/RequestRow'

class CampaignRequests extends Component {

    static async getInitialProps(props) {
        const address = props.query.address
        const campaing = Campaign(address)
        const requestsCount = await campaing.methods.getRequestsCount().call()
        const contributorsCount = await campaing.methods.contributorsCount().call()
        const requests = await Promise.all(
            Array(parseInt(requestsCount)).fill().map((element, index) => {
                return campaing.methods.requests(index).call()
            })
        )
        return {
            address: address,
            requestsCount: requestsCount,
            requests: requests,
            contributorsCount: parseInt(contributorsCount)
        }
    }

    renderRow = () => {
        return this.props.requests.map((request, index) => {
            return <RequestRow 
                id={index} 
                key={index} 
                request={request} 
                contributorsCount={this.props.contributorsCount} 
                address={this.props.address}
            />
        })
    }

    render() {       

        return (
            <Layout>
                <Link href={`/campaigns/${this.props.address}`}>Back</Link> 
                <h3>Requests</h3>
                <Link href={`/campaigns/${this.props.address}/requests/new`}>
                    <Button primary floated="right" style={{marginBottom: 10}}>Add Request</Button>
                </Link> 
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell>Value</Table.HeaderCell>
                            <Table.HeaderCell>Recipient</Table.HeaderCell>
                            <Table.HeaderCell>Approval Count</Table.HeaderCell>
                            <Table.HeaderCell>Approve</Table.HeaderCell>
                            <Table.HeaderCell>Finalize</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.renderRow()}
                    </Table.Body>
                </Table>
                <div>Found {this.props.requestsCount} requests</div>           
            </Layout>
        )
    }
}

export default CampaignRequests