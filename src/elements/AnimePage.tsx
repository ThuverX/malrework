interface iScoreDisplay{
    score:number,
    rank:string,
    users:string,
    animated?:boolean
}

function firstToUpper(str:string){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

class AnimeInfo extends React.Component<{data:any}>{
    render(){
        return (
            <div className="animeInfo">
                {
                    Object.keys(this.props.data).map((key,i) => this.props.data[key] 
                    && key != 'officialsite' && key != 'english' && key != 'japanese' && !key.includes('score') &&
                    <div key={i}>
                        {firstToUpper(key)}: {this.props.data[key]}
                    </div>)
                }
            </div>
        )
    }
}

interface iAnimeTabList {
    items:string[]
}

enum TabType{
    Details,
    Videos,
    Episodes,
    Reviews,
    Recommendations,
    Stats,
    Characters,
    News,
    Forum,
    Clubs,
    Pictures
}

class TabBodyDetails extends React.Component<{},{data:any}> {
    constructor(props:{data:any}){
        super(props)
        
        this.state = {
            data:{}
        }
    }

    componentDidMount(){
        this.setState({data:malRenewd.scraper.animepage.getDetails()})
    }

    render(){
        if(!this.state.data.background) return <div>Loading...</div>


        let related = this.state.data.relatedAnime

        related = related.sort((a:{title:string},b:{title:string}) => 
            +(a.title == "Alternative version" || a.title == "Alternative setting") 
        -   +(b.title == "Alternative version" || b.title == "Alternative setting"))

        return [
            <div className="backgroundinfo">
                <div className="title">Background information</div>
                <div className="text">{this.state.data.background}</div>
            </div>,
            <div className="relatedAnime">
                <div className="title">Related Titles</div>
                {related.map((item:any,i:number) => 
                    <div className="item" key={i}>
                        <div className={"title" + (item.title.startsWith('Alternative') ?' wide':'')}>{item.title}</div>
                        <div className="list">
                            {item.list.map((listItem:any,j:number) => <a id="link" key={j} onClick={() => malRenewd.navigate(listItem.href)}>{listItem.name + (j < item.list.length-1?',':'')}</a>)}
                        </div>
                    </div>
                )}
            </div>
        ]
    }
}

class TabBody extends React.Component <{
    tab:TabType
}> {
    render(){
        return (
            <div className="tabBody">
                {this.props.tab == TabType.Details && <TabBodyDetails/>}
            </div>
        )
    }
}

interface iAnimeStatusBox {
    currentStatus:eWatchStatus,
    maxEpisodes:number,
    currentEpisode:number,
    visibleDropDown:boolean
}

class AnimeStatusBox extends React.Component<{},iAnimeStatusBox> {

    input:React.RefObject<HTMLInputElement>
    initState:iAnimeStatusBox

    constructor(props:{}){
        super(props)

        this.state = {
            currentStatus:eWatchStatus.WATCHING,
            maxEpisodes:6,
            currentEpisode:0,
            visibleDropDown:false
        }

        this.initState = this.state

        this.input = React.createRef()
    }

    setStatus(status:string){
        let eStatus:eWatchStatus = eWatchStatus[status as keyof typeof eWatchStatus]

        this.setState({currentStatus:eStatus})
    }

    openDropDown(){
        this.setState({visibleDropDown:!this.state.visibleDropDown})
    }

    closeDropDown(){
        this.setState({visibleDropDown:false})
    }

    fixEpisode(){
        this.setState({currentEpisode:Math.min(this.state.maxEpisodes,Math.max(0,this.state.currentEpisode))})
    }

    increaseEpisode(){
        if(this.state.currentEpisode < this.state.maxEpisodes) this.setState({currentEpisode:Math.min(this.state.maxEpisodes,Math.max(0,this.state.currentEpisode + 1))})
    }

    decreaseEpisode(){
        if(this.state.currentEpisode > 0) this.setState({currentEpisode:Math.min(this.state.maxEpisodes,Math.max(0,this.state.currentEpisode - 1))})
    }

    setEpisode(){
        let num = parseInt(this.input.current!.value)
        this.setState({currentEpisode:num})
    }

    shouldComponentUpdate(nextProps:any,nextState:any){
        return JSON.stringify(this.state) != JSON.stringify(nextState)
    }

    saveState(){
        this.initState = this.state
        this.forceUpdate()
    }

    render(){
        let items = Object.keys(eWatchStatus).filter(value => isNaN(Number(value)) === true)

        items = items.sort((a:string,b:string) => 
            +(eWatchStatus[b as keyof typeof eWatchStatus] == this.state.currentStatus) 
          - +(eWatchStatus[a as keyof typeof eWatchStatus] == this.state.currentStatus))

        let sameState = this.initState.currentEpisode == this.state.currentEpisode && this.initState.currentStatus == this.state.currentStatus

        return (
            <div onMouseLeave={this.fixEpisode.bind(this)} onMouseEnter={this.fixEpisode.bind(this)} className="statusSelector">
                <div className="statusDropDown">
                    <div className={"dropDown" + (this.state.visibleDropDown?' clicked':'')} style={{zIndex:400}} onClick={this.openDropDown.bind(this)} onMouseLeave={this.closeDropDown.bind(this)}>
                        {items.map((item,i) => 
                            <div onClick={this.setStatus.bind(this,item)}className={"item " + item} key={i}>{eWatchStatusHumanReadableDisplay(eWatchStatus[item as keyof typeof eWatchStatus],(malRenewd.frameDoc && malRenewd.frameDoc!.location)?malRenewd.frameDoc!.location.pathname.includes("/manga/"):false)}</div>
                        )}
                    </div>
                </div>
                <div className={"episodeButtons" + (this.state.currentStatus == eWatchStatus.NONE?' hidden':'')}>
                    <div onClick={this.decreaseEpisode.bind(this)} className={"decrease episodeSelector" + (this.state.currentEpisode <= 0?' inactive':'')}></div>
                    <div className="setvalue episodeSelector">
                        <div className="inner"><input ref={this.input} onChange={this.setEpisode.bind(this)} type="number" min="0" max={this.state.maxEpisodes} value={this.state.currentEpisode}/></div>
                    </div>
                    <div onClick={this.increaseEpisode.bind(this)} className={"increase episodeSelector" + (this.state.currentEpisode >= this.state.maxEpisodes?' inactive':'')}></div>
                </div>
                <div className={"statusDropDown" + (sameState?' hidden':'')} style={{marginTop:'15px'}}>
                    <div className="dropDown flashOver" onClick={this.saveState.bind(this)}>Update</div>
                </div>
            </div>
        )
    }
}

class AnimeTabList extends React.Component<iAnimeTabList,{
    currentTab:TabType
}> {
    constructor(props:iAnimeTabList){
        super(props)

        this.state = {
            currentTab:TabType.Details
        }
    }

    changeTab(tab:TabType){
        this.setState({currentTab:tab})
    }

    render(){
        return [
            <div className="tabs">
                {this.props.items.map((item,i) => <div key={i} onClick={() => this.changeTab.call(this,TabType[item as keyof typeof TabType])} className={"item" + (TabType[item as keyof typeof TabType] == this.state.currentTab?' selected':'')}>{item}</div>)}
            </div>,
            <TabBody tab={this.state.currentTab}/>
        ]
    }
}

class ScoreDisplay extends React.Component<iScoreDisplay,{
    number:number,
    done:boolean
}>{
    constructor(props:iScoreDisplay){
        super(props)

        this.state = {
            number:0,
            done:false
        } 
    }

    componentDidMount(){
        this.countUp.call(this)
    }

    countUp(){
        if(this.state.number + this.props.score/50 >= this.props.score) 
            this.setState({number:this.props.score,done:true})
        else {
            this.setState({number:this.state.number + this.props.score/50})
            setTimeout(this.countUp.bind(this),1000/25 * (this.state.number/this.props.score + 0.1))
        }
    }

    render(){
        return (
            <div className={"scoreDisplay" + (!this.props.animated || this.state.done?' show':'')}>
                <div className="score">{this.props.animated?this.state.number.toFixed(2):this.props.score.toFixed(2)}</div>
                <div className="right">
                    {this.props.rank}<br/>
                    by {this.props.users} users
                </div>
            </div>
        )
    }
}

function getScoreFromString(str:string){
    let match = str.match(/(\d|\.|\,|\()/g)!.join('')
    let arr:any[] = match.split('(')
    arr[0] = parseFloat(arr[0])
    return arr
}

class AnimePage extends React.Component<iPage,{data:iAnime | null,key:number}> {
    constructor(props:iPage){
        super(props)
        
        this.state = {data:null,key:0}

        malRenewd.on('iframe_load_complete',() => 
            setTimeout(() => this.setState({data:malRenewd.scraper.animepage.getData(),key:Math.random()}),100)
        )
    }

    componentDidMount(){
        let data = malRenewd.scraper.animepage.getData()
        this.setState({data})

        if(data) malRenewd.setBackground(data!.imageUrl || "")
    }

    render(){
        if(!this.state.data) return <div>Loading...</div>

        let scoring = getScoreFromString(this.state.data!.information.score)

        return (
            <div className="page animePage" key={this.state.key}>
                <div className="inner">
                    <div className="leftSide">
                        <img className="animeImage" width="225" height="319" src={this.state.data!.imageUrl || ""}/>
                        <ScoreDisplay animated={true} score={scoring[0] || 0.00} users={scoring[1] || "100"} rank={this.state.data!.information.ranked || "#0000"}/>
                        <AnimeStatusBox/>
                        <AnimeInfo data={this.state.data!.information}/>
                    </div>
                    <div className="rightSide">
                        <div className="info">
                            <div className="titles">
                                <div className="titleBig">{this.state.data!.title}</div>
                                <div className="titleSmall">{this.state.data!.information.japanese}</div>
                            </div>
                            <div className="synopsis">{this.state.data!.synopsis}</div>
                            <AnimeTabList items={Object.keys(TabType).filter(value => isNaN(Number(value)) === true)}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}