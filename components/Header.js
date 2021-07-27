import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import Link from 'next/link'

class Header extends Component {
    render() {
        return (
            <Menu style={{marginTop: 15}}>
                <Menu.Item>
                    <Link href="/">CrowdCoin</Link>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item>
                    <Link href="/">Campaigns</Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link href="/campaigns/new">+</Link>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        )
    }    
}

export default Header