interface iStatGraph{
    data:{
        status:eWatchStatus,
        amount:number
    }[],
    title?:string,
    type:string,
    boxId:string,
    underTitle?:{
        days:number,
        mean:number
    }
}

class AnimeStatisticsStack extends React.Component<iStatGraph> {
    constructor(props:iStatGraph){
        super(props)
    }

    render(){
        let total = this.props.data.reduce((acc,curr) => acc + curr.amount,0)

        if(total <= 0) return (
            <div className={"dataBox " + this.props.boxId}>
                {this.props.title && <div className="title">{this.props.title}</div>}
                <div className="empty">This user has no {this.props.type} Statistics</div>
            </div>    
        )

        return (
            <div className={"dataBox " + this.props.boxId}>
                {this.props.title && <div className="title">{this.props.title}</div>}
                {this.props.underTitle && <div className="title right">
                    <div className="days">{this.props.underTitle.days} Days</div>
                    <div className="mean">{this.props.underTitle.mean} Mean Score</div>
                </div>}
                <div className="stack">
                    {this.props.data.map((item:any,i:number) =>
                        <div className={eWatchStatus[item.status]} key={i} style={{width:`${item.amount/total*100}%`}}>
                            <div className="text">{eWatchStatusHumanReadableDisplayAction(item.status,this.props.type == "Manga")} {item.amount} {this.props.type}</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

class ProfilePage extends React.Component<iPage,{data:any}> {
    constructor(props:iPage){
        super(props)
        this.state = {
            data:null
        }
    }

    componentDidMount(){
        let data = malRenewd.scraper.profilepage.getUserData()
        this.setState({data})

        malRenewd.setBackground(data.profileImage)
    }

    render(){
        if(!this.state.data) return <div>Loading...</div>

        let isOnline = this.state.data!.statusData.lastOnline == "Now"

        return (
            <div className="page profilePage">
                <div className="inner">
                    <div className="leftSide">
                        <img className="userImage" width="225" height="225" src={this.state.data!.profileImage || ""}/>
                        <div className="listButtons">
                            <div>Anime List</div>
                            <div>Manga List</div>
                        </div>
                        <div className="animeInfo">
                            <div id="link">0 Forum Posts</div>
                            <div id="link">0 Reviews</div>
                            <div id="link">0 Recommendations</div>
                            <div id="link">0 Blog Posts</div>
                            <div id="link">0 Clubs</div>
                        </div>
                    </div>
                    <div className="rightSide">
                        <div className="info">
                            <div className="titles">
                                <div className="titleBig">{this.state.data!.profileUserName || ""}</div>
                                <div className="titleSmall">
                                    <div className={"indicator" + (isOnline?' online':' offline')}></div> {(isOnline?'Online':'Offline')} - Joined on {this.state.data!.statusData.joinedDate}
                                </div>
                            </div>
                            <div className="synopsis">No biography yet.</div> 
                        </div>
                        <div className="data">
                            <AnimeStatisticsStack type="Anime" boxId="animeData" title="Anime Statistics" underTitle={this.state.data!.animeExtraData} data={this.state.data!.animeStackData}/>
                            <AnimeStatisticsStack type="Manga" boxId="mangaData" title="Manga Statistics" underTitle={this.state.data!.mangaExtraData} data={this.state.data!.mangaStackData}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}