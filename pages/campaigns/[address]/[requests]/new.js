import React, { Component } from 'react'
import Layout from '../../../../components/Layout'
import Campaign from '../../../../etherum/campaign'
import { Form, Button, Input, Message } from 'semantic-ui-react'
import web3 from '../../../../etherum/web3'
import Router from 'next/router'
import Link from 'next/link'

class CampaignRequests extends Component {
    
    state = {
        description: '',
        value: '',
        recipient: '',
        loading: false,
        errorMessage: ''
    }

    static async getInitialProps(props) {
        const address = props.query.address        
        return {
            address: address
        }
    }

    onSubmit = async (event) => {
        event.preventDefault()
        this.setState({errorMessage: '', loading: true})
        const campaing = Campaign(this.props.address)
        const {description, value, recipient} = this.state
        try {
            const accounts = await web3.eth.getAccounts()
            await campaing.methods.createRequest(
                description, 
                web3.utils.toWei(value, 'ether'), 
                recipient
            ).send({
                from: accounts[0],
            })
            Router.push(`/campaigns/${this.props.address}/requests`)
        } catch (err) {
            this.setState({errorMessage: err.message})
        }
        this.setState({loading: false})
    }

    render() {
        return (
            <Layout>
                <Link href={`/campaigns/${this.props.address}/requests`}>Back</Link>   
                <h3>Create a Request</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Description</label>
                        <Input 
                            value={this.state.description}
                            onChange={(event) => {this.setState({description: event.target.value})}}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Value in Ether</label>
                        <Input 
                            value={this.state.value}
                            onChange={(event) => {this.setState({value: event.target.value})}}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Recipient</label>
                        <Input 
                            value={this.state.recipient}
                            onChange={(event) => {this.setState({recipient: event.target.value})}}/>
                    </Form.Field>
                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button primary loading={this.state.loading}>Create!</Button>
                </Form>             
            </Layout>
        )
    }
}

export default CampaignRequests