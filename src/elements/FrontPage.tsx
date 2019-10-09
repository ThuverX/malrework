interface iPage extends iLockable{}

class FrontPage extends React.Component<iPage,{data:any,userData:any}> {
    constructor(props:iPage){
        super(props)
        this.state = {
            data:null,
            userData:null
        }

        malRenewd.on('iframe_load_complete',() => this.setState({userData:malRenewd.scraper.getUserData()}))
    }

    componentDidMount(){
        this.setState({
            data:{
                suggestions:malRenewd.scraper.frontpage.getSuggestions(),
                newAnime:malRenewd.scraper.frontpage.extractDataFromList('.widget.seasonal')
            },
            userData:malRenewd.scraper.getUserData()
        })
    }

    render(){
        return (
            <div className="page frontpage">
                {this.state.userData ? 
                <div className="welcomeWrapper">
                    <div className="message">Welcome back {this.state.userData.username}</div>
                    {this.state.data && this.state.data.suggestions && <CardLister locked={this.props.locked} cutoff={true} title="Here are some anime suggestion" floatRight={true} items={
                        this.state.data.suggestions.map((s:any) => {return {url:s.path,imageUrl:s.image,title:s.title}})
                    } displayCount={6}/>}
                </div>:""}
                <div className="newAnime">
                    <div className="message">Summer Anime 2019</div>
                    {this.state.data && this.state.data.newAnime && <CardLister locked={this.props.locked} cutoff={true} floatRight={false} items={
                        this.state.data.newAnime
                    } displayCount={6}/>}
                </div>
            </div>
        )
    }
}