import React, { Component } from 'react'
import { Button, Form, Input, Message } from 'semantic-ui-react'
import Campaing from '../etherum/campaign'
import web3 from '../etherum/web3'
import Router from 'next/router'

class ContributeForm extends Component {

    state = {
        value: '',
        loading: false,
        errorMessage: ''
    }

    onSubmit = async (event) => {        
        event.preventDefault()
        this.setState({loading: true, errorMessage: ''})
        const address = this.props.address
        const campaing = Campaing(address)
        try {
            const accounts = await web3.eth.getAccounts()
            await campaing.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether')
            })
            Router.replace(`/campaigns/${address}`)
        } catch (err) {
            this.setState({errorMessage: err.message})
        }
        this.setState({loading: false, value: ''})
    }

    render() {
        return (
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                    <label>Amount of ether</label>
                    <Input 
                        label="ether" 
                        labelPosition="right" 
                        value={this.state.value} 
                        onChange={(event) => {this.setState({value: event.target.value})}}
                    />
                </Form.Field>
                <Message error header="Oops!" content={this.state.errorMessage} />
                <Button primary loading={this.state.loading}>
                    Contribute!
                </Button>
            </Form>
        )
    }
}

export default ContributeForm
