interface iPage extends iLockable{}

class FrontPage extends React.Component<iPage,{data:any}> {
    constructor(props:iPage){
        super(props)
        this.state = {
            data:null
        }
    }

    componentDidMount(){
        this.setState({data:{
            suggestions:malRenewd.scraper.frontpage.getSuggestions(),
            newAnime:malRenewd.scraper.frontpage.extractDataFromList('.widget.seasonal')
        }})
    }

    render(){
        return (
            <div className="page frontpage">
                <div className="welcomeWrapper">
                    <div className="message">Welcome back ThuverX</div>
                    {this.state.data && this.state.data.suggestions && <CardLister locked={this.props.locked} cutoff={true} title="Here are some anime suggestion" floatRight={true} items={
                        this.state.data.suggestions.map((s:any) => {return {url:s.path,imageUrl:s.image,title:s.title}})
                    } displayCount={6}/>}
                </div>
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