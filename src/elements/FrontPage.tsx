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
                suggestions:malRenewd.scraper.frontpage.getAnimeSuggestions(),
                widgets:[
                    {subtitle:'What\'s hot this season',...malRenewd.scraper.frontpage.extractDataFromList('.widget.seasonal')},
                    {subtitle:'How about some reading',title:"Manga Suggestions",items:malRenewd.scraper.frontpage.getMangaSuggestions().map((s:any) => {return {url:s.path,imageUrl:s.image,title:s.title}})}
                ]
            },
            userData:malRenewd.scraper.getUserData()
        })
    }

    render(){
        return (
            <div className="page frontpage">
                {
                    !this.state.userData?
                    <div className="landing">

                    </div>:''
                }
                {this.state.userData ? 
                <div className="welcomeWrapper">
                    <div className="message">Welcome back {this.state.userData.username}</div>
                    {this.state.data && this.state.data.suggestions && <CardLister locked={this.props.locked} cutoff={true} title="Here are some anime suggestion" floatRight={true} items={
                        this.state.data.suggestions.map((s:any) => {return {url:s.path,imageUrl:s.image,title:s.title}})
                    } displayCount={6}/>}
                </div>:""}
                <div className="newAnime">
                {
                    this.state.data && this.state.data.widgets.map((i:any,x:number) => [
                        <div className={"message" + (x % 2 != 0?' right':'')}>{i.title}</div>,
                        <CardLister key={x} locked={this.props.locked} cutoff={true} title={i.subtitle||null} floatRight={x % 2 != 0} items={
                            i.items
                        } displayCount={6}/>]
                    )
                }
                </div>
            </div>
        )
    }
}