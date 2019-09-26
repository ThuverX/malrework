enum PageType {
    FRONT,
    ANIME,
    PROFILE,
    NONE
}

enum LoadingState {
    BUSY,
    DONE
}

class LoadingBarElement extends React.Component<{
    state:LoadingState
}>{
    render(){
        return <div className={"loadingBar" + (
            this.props.state === LoadingState.BUSY ? " half" :
            this.props.state === LoadingState.DONE ? " done" : "")}/>
    }
}

class Background extends React.Component <{darken:boolean},{
    backgroundUrl:String,
    newBackgroundUrl:String,
    fadingBackground:Boolean
}> {
    constructor(props:{darken:boolean}){
        super(props)

        this.state = {
            backgroundUrl:'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
            newBackgroundUrl:'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
            fadingBackground:false
        }

        malRenewd.on('full_change_background',(url:string) => {

            this.setState({
                fadingBackground:true,
                newBackgroundUrl:url
            })

            setTimeout(() => this.setState({fadingBackground:false,backgroundUrl:url}),600)
        })
    }

    render(){
        return [
            <div className={"background" + (this.state.fadingBackground?' out':'') + (this.props.darken?' dark':'')} style={{background:`url(${this.state.backgroundUrl}) center/cover no-repeat`}}></div>,
            <div className={"background" + (this.state.fadingBackground?' in':'') + (this.props.darken?' dark':'')} style={{background:`url(${this.state.newBackgroundUrl}) center/cover no-repeat`}}></div>,
        ]
    }
}

interface iLockable {
    locked:Boolean
}

class Main extends React.Component<{},{
    currentPage:PageType,
    visibleIframe:Boolean,
    loadingScreen:Boolean,
    loadingBarState:LoadingState,
    iframeLoaded:Boolean,
    fullIframe:Boolean
}> {

    constructor(props:Object){
        super(props)

        this.state = {
            currentPage:PageType.FRONT,
            visibleIframe:false,
            loadingScreen:true,
            loadingBarState:LoadingState.BUSY,
            iframeLoaded:false,
            fullIframe:false
        }

        malRenewd.on('full_nav',() => {
            this.setState({loadingBarState:LoadingState.BUSY,iframeLoaded:false})
        })
    }

    findCurrentPage(){
        if(malRenewd.frameDoc!.location.pathname.includes("/anime/") || malRenewd.frameDoc!.location.pathname.includes("/manga/"))
            return PageType.ANIME

        if(malRenewd.frameDoc!.location.pathname.startsWith("/profile/"))
            return PageType.PROFILE

        if(malRenewd.frameDoc!.location.pathname.startsWith("/animelist/"))
            return PageType.NONE

        return PageType.FRONT
    }


    iframeLoad(data:any){
        if(this.state.iframeLoaded) return
        
        const iframe:any = data.target

        malRenewd.setIframe(iframe)

        let cPage = this.findCurrentPage()

        this.setState({fullIframe:cPage == PageType.NONE,currentPage:cPage,loadingScreen:false,iframeLoaded:true,loadingBarState:LoadingState.DONE})
        
        malRenewd.log('Iframe loaded:',iframe.contentWindow.location.href)

        window.document.title = malRenewd.iframeWindow!.document.title

        if(cPage == PageType.NONE) malRenewd.iframeWindow!.onunload = () => {
            malRenewd.navigate(malRenewd.iframeWindow!.location.href)
            document.head.querySelectorAll('style:not(#css)').forEach(e => e.parentElement!.removeChild(e))
        }

        if(window.history.state != malRenewd.frameDoc!.title)window.history.pushState(malRenewd.frameDoc!.title, malRenewd.frameDoc!.title, malRenewd.frameDoc!.location.href)
        
        malRenewd.emit('iframe_load_complete')
    }
    
    
    render(){
        return [
        <Background darken={this.state.currentPage == PageType.PROFILE}/>,
        <TopBar elements={[
            {name:"Anime"},
            {name:"Manga"},
            {name:"Community"},
            {name:"Industry"},
            {name:"Watch"},
            {name:"Store"},
            {name:"Help"}
        ]}/>,
        !this.state.loadingScreen && ( this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.FRONT &&   <FrontPage locked={this.state.loadingBarState != LoadingState.DONE}/>,
        !this.state.loadingScreen && ( this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.ANIME &&   <AnimePage locked={this.state.loadingBarState != LoadingState.DONE}/>,
        !this.state.loadingScreen && ( this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.PROFILE && <ProfilePage locked={this.state.loadingBarState != LoadingState.DONE}/>,
        <LoadingBarElement state={this.state.loadingBarState} />,
        <div className={"loadingScreen" + (!this.state.loadingScreen ? " done" : "")}/>,
        <iframe className={"debug_iframe" + (this.state.fullIframe?' full':'')}
                style={{display:(this.state.visibleIframe || this.state.fullIframe) ? 'block' : 'none'}}
                onLoad={this.iframeLoad.bind(this)} 
                src={window.location.href} 
                width="600" 
                height="400"></iframe>
        ]
    }
}