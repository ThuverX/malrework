interface iTopBarElement {
    elements:iTopBarItemElement[]
}

interface iTopBarItemElement {
    name:String,
    action?:Function,
    floatRight?:Boolean
}

class TopBarItem extends React.Component<iTopBarItemElement> {
    render(){
        return (
            <div className={"button popoutButton" + (this.props.floatRight?" right":"")} onClick={(event) => this.props.action!(event)}>{this.props.name}</div>
        )
    }
}

class TopBar extends React.Component<iTopBarElement> {

    constructor(props:iTopBarElement){
        super(props)
    }

    render(){
        return (
            <nav>
                <div className="home" onClick={() => malRenewd.navigate('https://myanimelist.net/')}></div>
                {this.props.elements.map((item,i) => <TopBarItem floatRight={item.floatRight} action={item.action} name={item.name} key={i} />)}
                <div className="button username right popoutButton">
                    <a id="username">ThuverX</a>
                    <img src="https://cdn.myanimelist.net/images/userimages/6922875.jpg"/>
                </div>
            </nav>
        )
    }
}