interface iCard {
    title:String,
    url?:string,
    imageUrl:string
}

interface iCardLister extends iLockable{
    items:iCard[],
    displayCount:number,
    title?:String,
    floatRight?:Boolean,
    cutoff?:Boolean
}

class Card extends React.Component <iCard> {
    constructor(props:iCard){
        super(props)
    }

    render(){
        return (
            <div className="card" onClick={() => this.props.url?malRenewd.navigate(this.props.url):''}>
                <img width="160" height="220" src={this.props.imageUrl}/>
                <div className="name">{this.props.title}</div>
            </div>
        )
    }
}

class CardLister extends React.Component <iCardLister,{
    page:number
}> {
    constructor(props:iCardLister){
        super(props)

        this.state = {
            page:0
        }
    }

    previousPage(){
        if(this.props.floatRight) this.setState({page:this.state.page+1})
        else this.setState({page:this.state.page-1})
    }

    nextPage(){
        if(this.props.floatRight) this.setState({page:this.state.page-1})
        else this.setState({page:this.state.page+1})
    }

    shouldComponentUpdate(nextState:any){
        return !nextState.locked
    }

    render(){
        let items = this.props.items
        let offset = (items.length/this.props.displayCount % 1) * this.props.displayCount
        if(this.props.cutoff) items = items.slice(0,-1 * Math.round(offset))
        
        let itemMap:iCard[] = items.slice(this.state.page*this.props.displayCount,(this.state.page+1)*this.props.displayCount)
        
        malRenewd.setBackground(itemMap[0].imageUrl)
    
        return (
            <div className={"cardlist" + (this.props.floatRight?' right':'')}>
                {this.props.title?<div className="title">{this.props.title}</div>:''}
                <div className="listHolder" style={{width:(this.props.displayCount*180-(this.props.floatRight?40:40))+'px'}}>
                    { (!this.props.floatRight?this.state.page > 0:(this.state.page+1)*this.props.displayCount < items.length) && <div className="button buttonLeft" onClick={this.previousPage.bind(this)}></div>}
                        <div className="list">
                            {itemMap.map((item,i) => <Card title={item.title} url={item.url} imageUrl={item.imageUrl} key={Math.random()}/>)}
                        </div>
                    { (this.props.floatRight?this.state.page > 0:(this.state.page+1)*this.props.displayCount < items.length) && <div className="button buttonRight" onClick={this.nextPage.bind(this)}></div>}
                </div>
            </div>
        )
    }
}