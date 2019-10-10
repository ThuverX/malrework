interface iTopBarElement {
    elements:iTopBarItemElement[]
}

interface iTopBarItemElement {
    name:String,
    action?:Function,
    floatRight?:Boolean,
}

class TopBarItem extends React.Component<iTopBarItemElement> {

    openContext(){

    }

    render(){
        return (
            <div className={"button popoutButton" + (this.props.floatRight?" right":"")} onClick={this.openContext.bind(this)}>{this.props.name}</div>
        )
    }
}

class TopBar extends React.Component<iTopBarElement,{userData:any}> {

    constructor(props:iTopBarElement){
        super(props)

        this.state = {
            userData:null
        }

        malRenewd.on('iframe_load_complete',() => this.setState({userData:malRenewd.scraper.getUserData()}))
    }

    componentDidMount(){
        this.setState({userData:malRenewd.scraper.getUserData()})
    }

    gotoUserPage(){
        if(this.state.userData) malRenewd.navigate(`https://myanimelist.net/profile/${this.state.userData.username}`)
    }

    render(){
        return (
            <nav>
                <div className="home" onClick={() => malRenewd.navigate('https://myanimelist.net/')}></div>
                {this.props.elements.map((item,i) => <TopBarItem floatRight={item.floatRight} action={item.action} name={item.name} key={i} />)}
                <div className="button username right popoutButton" onClick={this.gotoUserPage.bind(this)}>
                    <a id="username">{this.state.userData ? this.state.userData.username : "Login"}</a>
                    {this.state.userData ? <img src={this.state.userData.imageUrl}/> : ""}
                </div>
            </nav>
        )
    }
}