/* Created by ThuverX, please check the license before editing */

function reloadCSS(){
    fetch(chrome.runtime.getURL('default.css'))
        .then((response) => response.text())
        .then((css) => {
            let oldCSS:HTMLElement | null = document.getElementById('css')
            if(oldCSS) oldCSS!.parentElement!.removeChild(oldCSS!)
            
            let style:HTMLElement = document.createElement('style')
                style.innerHTML = css
                style.id = 'css'
            document.head.appendChild(style)
        })
}

class EventEmmiter {
    _flist:any = {}

    on(fname:string,f:Function){
        if(!this._flist[fname]) this._flist[fname] = []
        this._flist[fname].push(f)
    }

    emit(fname:string,...data:any[]){
        if(this._flist[fname]) for(let f of this._flist[fname]) f(...data)
    }
}

window.onmessage = (event:any) => {
    if(event.data.name == "navigate")
        malRenewd.navigate(event.data.data)
    else if(event.data.name == "background")
        malRenewd.setBackground(event.data.data)
}

interface iAnime{
    imageUrl:string | null,
    title:string | null,
    synopsis:string | null,
    url:string | null,
    information:any | null
}

enum eWatchStatus {
    WATCHING = 1,
    COMPLETED = 2,
    ONHOLD = 3,
    DROPPED = 4,
    PLANNED = 6,
    NONE = -1
}

function eWatchStatusHumanReadableDisplay(status:eWatchStatus,manga:boolean = false){
    switch(status){
        case eWatchStatus.WATCHING: return !manga?"Watching":"Reading"
        case eWatchStatus.COMPLETED: return "Completed"
        case eWatchStatus.ONHOLD: return "On-Hold"
        case eWatchStatus.DROPPED: return "Dropped"
        case eWatchStatus.PLANNED: return "Planned"
        case eWatchStatus.NONE: return "No Status"
        default: return "No Status"
    }
}

function eWatchStatusHumanReadableDisplayAction(status:eWatchStatus,manga:boolean = false){
    switch(status){
        case eWatchStatus.WATCHING: return !manga?"Watching":"Reading"
        case eWatchStatus.COMPLETED: return "Completed"
        case eWatchStatus.ONHOLD: return "Holding"
        case eWatchStatus.DROPPED: return "Dropped"
        case eWatchStatus.PLANNED: return "Planning"
        case eWatchStatus.NONE: return "No Status"
        default: return "No Status"
    }
}

const malRenewd = new class MalRenewd extends EventEmmiter{
    public iframeWindow:Window | null = null
    public iframe:HTMLIFrameElement | null = null

    public frameDoc:Document | null = null

    public malConnection = new class malConnection{
        MAL_BASE:string = "https://myanimelist.net"
        mal:MalRenewd

        constructor(mal:MalRenewd){
            this.mal = mal
        }
    
        post(url:string,data:any,c:Function){
            const xhr = new XMLHttpRequest()
            xhr.open("POST", url, true)
    
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200)
                    c(xhr.responseText)
            }

            xhr.send(JSON.stringify(data))
        }

        csrf_token(){
            return this!.mal!.frameDoc!.querySelector('meta[name="csrf_token"]')!.getAttribute('content')
        }
    
        addAnimeEntry(id:number,status:eWatchStatus,score:number,episodes:number,c:Function){
            let csrf_token = this.csrf_token()
            let url:string = this.MAL_BASE + "/ownlist/anime/add.json"
            this.post(url,{
                anime_id:id,
                status,
                score,
                num_watched_episodes:episodes || 0,
                csrf_token
            },c)
        }
    
        updateAnimeEntry(id:number,status:eWatchStatus,score:number,episodes:number,c:Function){
            let csrf_token = this.csrf_token()
            let url:string = this.MAL_BASE + "/ownlist/anime/edit.json"
            this.post(url,{
                anime_id:id,
                status,
                score,
                num_watched_episodes:episodes || 0,
                csrf_token
            },c)
        }
    
        deleteAnimeEntry(id:number,c:Function){
            let csrf_token = this.csrf_token()
            let url:string = this.MAL_BASE + `/ownlist/anime/${id}/delete`
            this.post(url,{csrf_token},c)
        }
    }(this)

    setIframe(element:any){
        this.iframeWindow = element.contentWindow
        this.iframe = element
        this.frameDoc = element.contentWindow ? element.contentWindow.document : element.contentDocument
    }

    log(...args:any[]){
        console.log('['+'%cMalRenewd'+'%c]','color:red','color:inherit',...args)
    }

    navigate(page:string){
        this.iframe!.src = page

        this.emit('full_nav')
    }

    setBackground(imageUrl:string){
        this.emit('full_change_background',imageUrl)
    }

    scraper = {
        profilepage:{
            getUserData:() => {
                if(!this.frameDoc) return null

                let final:any = {}

                const getStatStack = (selector:string) => {
                    let stackData:any = []

                    let holder:HTMLElement | null = this.frameDoc!.querySelector('#statistics ' + selector)

                    let statusList:HTMLElement | null = holder!.querySelector('.stats-status')


                    if(selector.includes('anime'))
                        stackData.push({
                            status:eWatchStatus.WATCHING,
                            amount:parseInt(statusList!.querySelector('.watching + span')!.textContent || "0")
                        })
                    else
                        stackData.push({
                            status:eWatchStatus.WATCHING,
                            amount:parseInt(statusList!.querySelector('.reading + span')!.textContent || "0")
                        })

                    stackData.push({
                        status:eWatchStatus.COMPLETED,
                        amount:parseInt(statusList!.querySelector('.completed + span')!.textContent || "0")
                    })

                    stackData.push({
                        status:eWatchStatus.ONHOLD,
                        amount:parseInt(statusList!.querySelector('.on_hold + span')!.textContent || "0")
                    })

                    stackData.push({
                        status:eWatchStatus.DROPPED,
                        amount:parseInt(statusList!.querySelector('.dropped + span')!.textContent || "0")
                    })

                    if(selector.includes('anime'))
                        stackData.push({
                            status:eWatchStatus.PLANNED,
                            amount:parseInt(statusList!.querySelector('.plan_to_watch + span')!.textContent || "0")
                        })
                    else
                        stackData.push({
                            status:eWatchStatus.PLANNED,
                            amount:parseInt(statusList!.querySelector('.plan_to_read + span')!.textContent || "0")
                        })

                    return stackData
                }

                const getExtraNumberData = (selector:string) => {
                    let data:any = {}

                    let holder:HTMLElement | null = this.frameDoc!.querySelector('#statistics ' + selector + ' .stat-score')

                    data.days = parseFloat(holder!.querySelector('.al')!.childNodes[1].textContent || "0").toFixed(1)

                    data.mean = parseFloat(holder!.querySelector('.ar')!.childNodes[1].textContent || "0").toFixed(2)

                    return data
                }

                const getUserStatus = () => {
                    let lastOnline = ""
                    let joinedDate = ""

                    let lastOnlineTitle:Node | null = this.frameDoc!.evaluate("//span[text()='Last Online']", this.frameDoc!, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if(lastOnlineTitle) lastOnline = lastOnlineTitle!.parentElement!.querySelector('span.fl-r')!.textContent || ""

                    let joinedDateTitle:Node | null = this.frameDoc!.evaluate("//span[text()='Joined']", this.frameDoc!, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if(joinedDateTitle) joinedDate = joinedDateTitle!.parentElement!.querySelector('span.fl-r')!.textContent || ""

                    return {
                        lastOnline,
                        joinedDate
                    }
                }

                let profileImageElement:HTMLImageElement | null = this.frameDoc!.querySelector('.user-profile > .user-image > img')

                final = {
                    profileImage:profileImageElement?profileImageElement!.src:"https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                    profileUserName:this.frameDoc!.title.slice(0,-28),
                    animeStackData:getStatStack('.stats.anime'),
                    animeExtraData:getExtraNumberData('.stats.anime'),
                    mangaStackData:getStatStack('.stats.manga'),
                    mangaExtraData:getExtraNumberData('.stats.manga'),
                    statusData:getUserStatus()
                }

                this.log('User profile data: ',final)

                return final
            }
        },
        frontpage:{
            getSuggestions:() => {
                if(!this.frameDoc) return null
                let el = this.frameDoc!.getElementById("v-auto-recommendation-personalized_anime")
                if(el) return JSON.parse(el.getAttribute("data-initial-data") || '[]')
            },
            extractDataFromList:(selector:string) => {
                if(!this.frameDoc) return null

                let holder = this.frameDoc!.querySelector(selector + " .widget-slide")

                let final:any = []

                for(let child of holder!.children) {
                    let href:String = (<HTMLAreaElement>child.children[0]).href

                    let data:HTMLElement | null = child.children[0].querySelector('img')

                    let imageUrl:String = data!.getAttribute('data-src') || ""

                    let title:String = data!.getAttribute('alt') || ""

                    final.push({
                        url:href,
                        imageUrl,
                        title
                    })
                }

                return final
            }
        },
        animepage:{
            getDetails:() => {
                if(!this.frameDoc) return null

                let final:any = {}

                const getAnimeBackgroundInfo = () => {
                    let holder = this.frameDoc!.querySelector("td[valign='top'] td[valign='top']")
                    if(!holder) return

                    let list:any[] = []

                    Array.from(holder.childNodes).forEach((e) => e.nodeName == "#text" || e.nodeName == "A" || e.nodeName == "I"?list.push(e.textContent):0)
                
                    let final:string = list.join('')
                    return final.startsWith('No background information has been added')?'No background information has been added yet.':final
                }

                const getRelatedAnime = () => {
                    let holder = this.frameDoc!.querySelectorAll(".anime_detail_related_anime > tbody > tr")
                
                    let data = []

                    interface iRelatedAnimeListData {
                        title:String,
                        list:{
                            href:String,
                            name:String
                        }[]
                    }
                
                    for(const e of holder){
                        let item:iRelatedAnimeListData = {
                            title:'noTitle',
                            list:[]
                        }
                        item.title = e.childNodes[0]!.textContent!.replace(':','')
                
                        for(const i of e.children[1].children)
                            if((<HTMLAreaElement>i).href)
                                item.list.push({href:(<HTMLAreaElement>i).href,name:(<HTMLAreaElement>i).innerText})
                        
                        data.push(item)
                    }
                
                    return data
                }

                final.background = getAnimeBackgroundInfo()
                final.relatedAnime = getRelatedAnime()

                malRenewd.log('Detail page Data: ',final)

                return final
            },
            getData:() => {
                if(!this.frameDoc) return null

                const infoFixer = () => {
                    const fixString = (str:string,rep?:string) => {
                        let t = str
                        if(rep) t = str.replace(rep,'')
                        t = t.replace(/^\s+|\s+$|\s+(?=\s)/g,'')
                        t = t.replace(/\r?\n|\r/g,"")
                        t = t.replace(` 2 based on the top anime page. Please note that 'Not yet aired' and 'R18+' titles are excluded.`,'')
                        t = t.replace(` 1 indicates a weighted score. Please note that 'Not yet aired' titles are excluded.`,'')
                        t = t.replace(` 2 based on the top manga page. Please note that 'R18+' titles are excluded.`,'')
                        t = t.replace(`1 indicates a weighted score. Please note that 'Not yet published' titles are excluded.`,'')
                        t = t.replace(`None found, add some`,'No data')
                        return t
                    }

                    let listElements:NodeListOf<Element> = this.frameDoc!.querySelectorAll('div.js-scrollfix-bottom > div')

                    let data:any = {}

                    if(listElements) for(let el of listElements){
                        let child:any = el.children[0]
                        let text:any = el
                        if(!child || !text) continue
                        let key:string = child.innerText.replace(':','')
                        if( key .replace(/^\s+|\s+$|\s+(?=\s)/g,'')
                                .replace(/\r?\n|\r/g,"").length > 0) {
                            let keyname:string = key.replace(/^\s+|\s+$|\s+(?=\s)/g,'')
                                                    .replace(/\r?\n|\r/g,"")
                                                    .replace(/ /g,'')
                                                    .toLowerCase()
                            if(keyname.includes('score') && keyname != 'score')
                                data['score'] = fixString(text.innerText.split(': ')[1])
                            data[keyname] = fixString(text.innerText,child.innerText)
                                        
                        }
                    }

                    return data
                }

                let imageElement:HTMLMetaElement | null = this.frameDoc!.head
                    .querySelector("meta[property='og:image']")
                let titleElement:HTMLMetaElement | null = this.frameDoc!.head
                    .querySelector("meta[property='og:title']")
                let synopsisElement:HTMLMetaElement | null = this.frameDoc!.head
                    .querySelector("meta[property='og:description']")
                let urlElement:HTMLMetaElement | null = this.frameDoc!.head
                    .querySelector("meta[property='og:url']")

                let final:iAnime = {
                    imageUrl:imageElement!.content,
                    title:titleElement!.content,
                    synopsis:synopsisElement!.content,
                    url:urlElement!.content,
                    information:infoFixer()
                }

                malRenewd.log('Basic page Data: ',final)
                
                return final
            }
        }
    }
}()

window.addEventListener('popstate', () => malRenewd.navigate(window.location.href))


function preload(){
    document.body.innerHTML = "<app></app>"
    document.head.querySelectorAll('link').forEach(i => 
        (i.rel == "stylesheet" || i.type == "style")?document.head.removeChild(i):0)

    document.head.querySelectorAll('script').forEach(i => document.head.removeChild(i))

    reloadCSS()

    setTimeout(() => {
        document.head.removeChild(document.getElementById("transition")!)
    }, 100)

    ReactDOM.render(
        React.createElement(Main),
        document.querySelector('app')
    )
}

window.onload = preload

document.addEventListener('DOMSubtreeModified', doSmoother, false);
 
function doSmoother(){
    if(document.head){
        document.removeEventListener('DOMSubtreeModified', doSmoother, false)

        let style = document.createElement('style')
            style.id = "transition"
            style.innerHTML = `body *{opacity:0;}body{background:black !important;overflow:hidden !important;}`

        document.head.appendChild(style)
    }
}