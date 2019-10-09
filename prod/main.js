"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
function reloadCSS() {
    fetch(chrome.runtime.getURL('default.css'))
        .then(function (response) { return response.text(); })
        .then(function (css) {
        var oldCSS = document.getElementById('css');
        if (oldCSS)
            oldCSS.parentElement.removeChild(oldCSS);
        var style = document.createElement('style');
        style.innerHTML = css;
        style.id = 'css';
        document.head.appendChild(style);
    });
}
var EventEmmiter = (function () {
    function EventEmmiter() {
        this._flist = {};
    }
    EventEmmiter.prototype.on = function (fname, f) {
        if (!this._flist[fname])
            this._flist[fname] = [];
        this._flist[fname].push(f);
    };
    EventEmmiter.prototype.emit = function (fname) {
        var e_1, _a;
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this._flist[fname])
            try {
                for (var _b = __values(this._flist[fname]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var f = _c.value;
                    f.apply(void 0, __spread(data));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
    };
    return EventEmmiter;
}());
window.onmessage = function (event) {
    if (event.data.name == "navigate")
        malRenewd.navigate(event.data.data);
    else if (event.data.name == "background")
        malRenewd.setBackground(event.data.data);
};
var eWatchStatus;
(function (eWatchStatus) {
    eWatchStatus[eWatchStatus["WATCHING"] = 1] = "WATCHING";
    eWatchStatus[eWatchStatus["COMPLETED"] = 2] = "COMPLETED";
    eWatchStatus[eWatchStatus["ONHOLD"] = 3] = "ONHOLD";
    eWatchStatus[eWatchStatus["DROPPED"] = 4] = "DROPPED";
    eWatchStatus[eWatchStatus["PLANNED"] = 6] = "PLANNED";
    eWatchStatus[eWatchStatus["NONE"] = -1] = "NONE";
})(eWatchStatus || (eWatchStatus = {}));
function eWatchStatusHumanReadableDisplay(status, manga) {
    if (manga === void 0) { manga = false; }
    switch (status) {
        case eWatchStatus.WATCHING: return !manga ? "Watching" : "Reading";
        case eWatchStatus.COMPLETED: return "Completed";
        case eWatchStatus.ONHOLD: return "On-Hold";
        case eWatchStatus.DROPPED: return "Dropped";
        case eWatchStatus.PLANNED: return "Planned";
        case eWatchStatus.NONE: return "No Status";
        default: return "No Status";
    }
}
function eWatchStatusHumanReadableDisplayAction(status, manga) {
    if (manga === void 0) { manga = false; }
    switch (status) {
        case eWatchStatus.WATCHING: return !manga ? "Watching" : "Reading";
        case eWatchStatus.COMPLETED: return "Completed";
        case eWatchStatus.ONHOLD: return "Holding";
        case eWatchStatus.DROPPED: return "Dropped";
        case eWatchStatus.PLANNED: return "Planning";
        case eWatchStatus.NONE: return "No Status";
        default: return "No Status";
    }
}
var malRenewd = new (function (_super) {
    __extends(MalRenewd, _super);
    function MalRenewd() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.iframeWindow = null;
        _this.iframe = null;
        _this.frameDoc = null;
        _this.malConnection = new (function () {
            function malConnection(mal) {
                this.MAL_BASE = "https://myanimelist.net";
                this.mal = mal;
            }
            malConnection.prototype.post = function (url, data, c) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.onreadystatechange = function () {
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200)
                        c(xhr.responseText);
                };
                xhr.send(JSON.stringify(data));
            };
            malConnection.prototype.csrf_token = function () {
                return this.mal.frameDoc.querySelector('meta[name="csrf_token"]').getAttribute('content');
            };
            malConnection.prototype.addAnimeEntry = function (id, status, score, episodes, c) {
                var csrf_token = this.csrf_token();
                var url = this.MAL_BASE + "/ownlist/anime/add.json";
                this.post(url, {
                    anime_id: id,
                    status: status,
                    score: score,
                    num_watched_episodes: episodes || 0,
                    csrf_token: csrf_token
                }, c);
            };
            malConnection.prototype.updateAnimeEntry = function (id, status, score, episodes, c) {
                var csrf_token = this.csrf_token();
                var url = this.MAL_BASE + "/ownlist/anime/edit.json";
                this.post(url, {
                    anime_id: id,
                    status: status,
                    score: score,
                    num_watched_episodes: episodes || 0,
                    csrf_token: csrf_token
                }, c);
            };
            malConnection.prototype.deleteAnimeEntry = function (id, c) {
                var csrf_token = this.csrf_token();
                var url = this.MAL_BASE + ("/ownlist/anime/" + id + "/delete");
                this.post(url, { csrf_token: csrf_token }, c);
            };
            return malConnection;
        }())(_this);
        _this.scraper = {
            getUserData: function () {
                if (!_this.frameDoc)
                    return null;
                var final = {};
                var headerProfileHolder = _this.frameDoc.querySelector('div.header-menu-unit.header-profile.pl0');
                if (!headerProfileHolder)
                    return null;
                var dataHolder = headerProfileHolder.children[0];
                final.username = dataHolder.getAttribute('title');
                final.imageUrl = dataHolder.style.backgroundImage.match(/url\(\"(.*?)\"\)/)[1];
                return final;
            },
            profilepage: {
                getUserData: function () {
                    if (!_this.frameDoc)
                        return null;
                    var final = {};
                    var getStatStack = function (selector) {
                        var stackData = [];
                        var holder = _this.frameDoc.querySelector('#statistics ' + selector);
                        var statusList = holder.querySelector('.stats-status');
                        if (selector.includes('anime'))
                            stackData.push({
                                status: eWatchStatus.WATCHING,
                                amount: parseInt(statusList.querySelector('.watching + span').textContent || "0")
                            });
                        else
                            stackData.push({
                                status: eWatchStatus.WATCHING,
                                amount: parseInt(statusList.querySelector('.reading + span').textContent || "0")
                            });
                        stackData.push({
                            status: eWatchStatus.COMPLETED,
                            amount: parseInt(statusList.querySelector('.completed + span').textContent || "0")
                        });
                        stackData.push({
                            status: eWatchStatus.ONHOLD,
                            amount: parseInt(statusList.querySelector('.on_hold + span').textContent || "0")
                        });
                        stackData.push({
                            status: eWatchStatus.DROPPED,
                            amount: parseInt(statusList.querySelector('.dropped + span').textContent || "0")
                        });
                        if (selector.includes('anime'))
                            stackData.push({
                                status: eWatchStatus.PLANNED,
                                amount: parseInt(statusList.querySelector('.plan_to_watch + span').textContent || "0")
                            });
                        else
                            stackData.push({
                                status: eWatchStatus.PLANNED,
                                amount: parseInt(statusList.querySelector('.plan_to_read + span').textContent || "0")
                            });
                        return stackData;
                    };
                    var getExtraNumberData = function (selector) {
                        var data = {};
                        var holder = _this.frameDoc.querySelector('#statistics ' + selector + ' .stat-score');
                        data.days = parseFloat(holder.querySelector('.al').childNodes[1].textContent || "0").toFixed(1);
                        data.mean = parseFloat(holder.querySelector('.ar').childNodes[1].textContent || "0").toFixed(2);
                        return data;
                    };
                    var getUserStatus = function () {
                        var lastOnline = "";
                        var joinedDate = "";
                        var lastOnlineTitle = _this.frameDoc.evaluate("//span[text()='Last Online']", _this.frameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (lastOnlineTitle)
                            lastOnline = lastOnlineTitle.parentElement.querySelector('span.fl-r').textContent || "";
                        var joinedDateTitle = _this.frameDoc.evaluate("//span[text()='Joined']", _this.frameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (joinedDateTitle)
                            joinedDate = joinedDateTitle.parentElement.querySelector('span.fl-r').textContent || "";
                        return {
                            lastOnline: lastOnline,
                            joinedDate: joinedDate
                        };
                    };
                    var profileImageElement = _this.frameDoc.querySelector('.user-profile > .user-image > img');
                    final = {
                        profileImage: profileImageElement ? profileImageElement.src : "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                        profileUserName: _this.frameDoc.title.slice(0, -28),
                        animeStackData: getStatStack('.stats.anime'),
                        animeExtraData: getExtraNumberData('.stats.anime'),
                        mangaStackData: getStatStack('.stats.manga'),
                        mangaExtraData: getExtraNumberData('.stats.manga'),
                        statusData: getUserStatus()
                    };
                    _this.log('User profile data: ', final);
                    return final;
                }
            },
            frontpage: {
                getSuggestions: function () {
                    if (!_this.frameDoc)
                        return null;
                    var el = _this.frameDoc.getElementById("v-auto-recommendation-personalized_anime");
                    if (el)
                        return JSON.parse(el.getAttribute("data-initial-data") || '[]');
                },
                extractDataFromList: function (selector) {
                    var e_2, _a;
                    if (!_this.frameDoc)
                        return null;
                    var holder = _this.frameDoc.querySelector(selector + " .widget-slide");
                    var final = [];
                    try {
                        for (var _b = __values(holder.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var child = _c.value;
                            var href = child.children[0].href;
                            var data = child.children[0].querySelector('img');
                            var imageUrl = data.getAttribute('data-src') || "";
                            var title = data.getAttribute('alt') || "";
                            final.push({
                                url: href,
                                imageUrl: imageUrl,
                                title: title
                            });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return final;
                }
            },
            animepage: {
                getDetails: function () {
                    if (!_this.frameDoc)
                        return null;
                    var final = {};
                    var getAnimeBackgroundInfo = function () {
                        var holder = _this.frameDoc.querySelector("td[valign='top'] td[valign='top']");
                        if (!holder)
                            return;
                        var list = [];
                        Array.from(holder.childNodes).forEach(function (e) { return e.nodeName == "#text" || e.nodeName == "A" || e.nodeName == "I" ? list.push(e.textContent) : 0; });
                        var final = list.join('');
                        return final.startsWith('No background information has been added') ? 'No background information has been added yet.' : final;
                    };
                    var getRelatedAnime = function () {
                        var e_3, _a, e_4, _b;
                        var holder = _this.frameDoc.querySelectorAll(".anime_detail_related_anime > tbody > tr");
                        var data = [];
                        try {
                            for (var holder_1 = __values(holder), holder_1_1 = holder_1.next(); !holder_1_1.done; holder_1_1 = holder_1.next()) {
                                var e = holder_1_1.value;
                                var item = {
                                    title: 'noTitle',
                                    list: []
                                };
                                item.title = e.childNodes[0].textContent.replace(':', '');
                                try {
                                    for (var _c = (e_4 = void 0, __values(e.children[1].children)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                        var i = _d.value;
                                        if (i.href)
                                            item.list.push({ href: i.href, name: i.innerText });
                                    }
                                }
                                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                finally {
                                    try {
                                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                                    }
                                    finally { if (e_4) throw e_4.error; }
                                }
                                data.push(item);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (holder_1_1 && !holder_1_1.done && (_a = holder_1.return)) _a.call(holder_1);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return data;
                    };
                    final.background = getAnimeBackgroundInfo();
                    final.relatedAnime = getRelatedAnime();
                    malRenewd.log('Detail page Data: ', final);
                    return final;
                },
                getData: function () {
                    if (!_this.frameDoc)
                        return null;
                    var infoFixer = function () {
                        var e_5, _a;
                        var fixString = function (str, rep) {
                            var t = str;
                            if (rep)
                                t = str.replace(rep, '');
                            t = t.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
                            t = t.replace(/\r?\n|\r/g, "");
                            t = t.replace(" 2 based on the top anime page. Please note that 'Not yet aired' and 'R18+' titles are excluded.", '');
                            t = t.replace(" 1 indicates a weighted score. Please note that 'Not yet aired' titles are excluded.", '');
                            t = t.replace(" 2 based on the top manga page. Please note that 'R18+' titles are excluded.", '');
                            t = t.replace("1 indicates a weighted score. Please note that 'Not yet published' titles are excluded.", '');
                            t = t.replace("None found, add some", 'No data');
                            return t;
                        };
                        var listElements = _this.frameDoc.querySelectorAll('div.js-scrollfix-bottom > div');
                        var data = {};
                        if (listElements)
                            try {
                                for (var listElements_1 = __values(listElements), listElements_1_1 = listElements_1.next(); !listElements_1_1.done; listElements_1_1 = listElements_1.next()) {
                                    var el = listElements_1_1.value;
                                    var child = el.children[0];
                                    var text = el;
                                    if (!child || !text)
                                        continue;
                                    var key = child.innerText.replace(':', '');
                                    if (key.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
                                        .replace(/\r?\n|\r/g, "").length > 0) {
                                        var keyname = key.replace(/^\s+|\s+$|\s+(?=\s)/g, '')
                                            .replace(/\r?\n|\r/g, "")
                                            .replace(/ /g, '')
                                            .toLowerCase();
                                        if (keyname.includes('score') && keyname != 'score')
                                            data['score'] = fixString(text.innerText.split(': ')[1]);
                                        data[keyname] = fixString(text.innerText, child.innerText);
                                    }
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (listElements_1_1 && !listElements_1_1.done && (_a = listElements_1.return)) _a.call(listElements_1);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                        return data;
                    };
                    var imageElement = _this.frameDoc.head
                        .querySelector("meta[property='og:image']");
                    var titleElement = _this.frameDoc.head
                        .querySelector("meta[property='og:title']");
                    var synopsisElement = _this.frameDoc.head
                        .querySelector("meta[property='og:description']");
                    var urlElement = _this.frameDoc.head
                        .querySelector("meta[property='og:url']");
                    var final = {
                        imageUrl: imageElement.content,
                        title: titleElement.content,
                        synopsis: synopsisElement.content,
                        url: urlElement.content,
                        information: infoFixer()
                    };
                    malRenewd.log('Basic page Data: ', final);
                    return final;
                }
            }
        };
        return _this;
    }
    MalRenewd.prototype.setIframe = function (element) {
        this.iframeWindow = element.contentWindow;
        this.iframe = element;
        this.frameDoc = element.contentWindow ? element.contentWindow.document : element.contentDocument;
    };
    MalRenewd.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, __spread(['[' + '%cMalRenewd' + '%c]', 'color:red', 'color:inherit'], args));
    };
    MalRenewd.prototype.navigate = function (page) {
        this.iframe.src = page;
        this.emit('full_nav');
    };
    MalRenewd.prototype.setBackground = function (imageUrl) {
        this.emit('full_change_background', imageUrl);
    };
    return MalRenewd;
}(EventEmmiter))();
window.addEventListener('popstate', function () { return malRenewd.navigate(window.location.href); });
function preload() {
    document.body.innerHTML = "<app></app>";
    document.head.querySelectorAll('link').forEach(function (i) {
        return (i.rel == "stylesheet" || i.type == "style") ? document.head.removeChild(i) : 0;
    });
    document.head.querySelectorAll('script').forEach(function (i) { return document.head.removeChild(i); });
    reloadCSS();
    setTimeout(function () {
        document.head.removeChild(document.getElementById("transition"));
    }, 100);
    ReactDOM.render(React.createElement(Main), document.querySelector('app'));
}
window.onload = preload;
document.addEventListener('DOMSubtreeModified', doSmoother, false);
function doSmoother() {
    if (document.head) {
        document.removeEventListener('DOMSubtreeModified', doSmoother, false);
        var style = document.createElement('style');
        style.id = "transition";
        style.innerHTML = "body *{opacity:0;}body{background:black !important;overflow:hidden !important;}";
        document.head.appendChild(style);
    }
}
function firstToUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
var AnimeInfo = (function (_super) {
    __extends(AnimeInfo, _super);
    function AnimeInfo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimeInfo.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "animeInfo" }, Object.keys(this.props.data).map(function (key, i) { return _this.props.data[key]
            && key != 'officialsite' && key != 'english' && key != 'japanese' && !key.includes('score') &&
            React.createElement("div", { key: i },
                firstToUpper(key),
                ": ",
                _this.props.data[key]); })));
    };
    return AnimeInfo;
}(React.Component));
var TabType;
(function (TabType) {
    TabType[TabType["Details"] = 0] = "Details";
    TabType[TabType["Videos"] = 1] = "Videos";
    TabType[TabType["Episodes"] = 2] = "Episodes";
    TabType[TabType["Reviews"] = 3] = "Reviews";
    TabType[TabType["Recommendations"] = 4] = "Recommendations";
    TabType[TabType["Stats"] = 5] = "Stats";
    TabType[TabType["Characters"] = 6] = "Characters";
    TabType[TabType["News"] = 7] = "News";
    TabType[TabType["Forum"] = 8] = "Forum";
    TabType[TabType["Clubs"] = 9] = "Clubs";
    TabType[TabType["Pictures"] = 10] = "Pictures";
})(TabType || (TabType = {}));
var TabBodyDetails = (function (_super) {
    __extends(TabBodyDetails, _super);
    function TabBodyDetails(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: {}
        };
        return _this;
    }
    TabBodyDetails.prototype.componentDidMount = function () {
        this.setState({ data: malRenewd.scraper.animepage.getDetails() });
    };
    TabBodyDetails.prototype.render = function () {
        if (!this.state.data.background)
            return React.createElement("div", null, "Loading...");
        var related = this.state.data.relatedAnime;
        related = related.sort(function (a, b) {
            return +(a.title == "Alternative version" || a.title == "Alternative setting")
                - +(b.title == "Alternative version" || b.title == "Alternative setting");
        });
        return [
            React.createElement("div", { className: "backgroundinfo" },
                React.createElement("div", { className: "title" }, "Background information"),
                React.createElement("div", { className: "text" }, this.state.data.background)),
            React.createElement("div", { className: "relatedAnime" },
                React.createElement("div", { className: "title" }, "Related Titles"),
                related.map(function (item, i) {
                    return React.createElement("div", { className: "item", key: i },
                        React.createElement("div", { className: "title" + (item.title.startsWith('Alternative') ? ' wide' : '') }, item.title),
                        React.createElement("div", { className: "list" }, item.list.map(function (listItem, j) { return React.createElement("a", { id: "link", key: j, onClick: function () { return malRenewd.navigate(listItem.href); } }, listItem.name + (j < item.list.length - 1 ? ',' : '')); })));
                }))
        ];
    };
    return TabBodyDetails;
}(React.Component));
var TabBody = (function (_super) {
    __extends(TabBody, _super);
    function TabBody() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabBody.prototype.render = function () {
        return (React.createElement("div", { className: "tabBody" }, this.props.tab == TabType.Details && React.createElement(TabBodyDetails, null)));
    };
    return TabBody;
}(React.Component));
var AnimeStatusBox = (function (_super) {
    __extends(AnimeStatusBox, _super);
    function AnimeStatusBox(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            currentStatus: eWatchStatus.WATCHING,
            maxEpisodes: 6,
            currentEpisode: 0,
            visibleDropDown: false
        };
        _this.initState = _this.state;
        _this.input = React.createRef();
        return _this;
    }
    AnimeStatusBox.prototype.setStatus = function (status) {
        var eStatus = eWatchStatus[status];
        this.setState({ currentStatus: eStatus });
    };
    AnimeStatusBox.prototype.openDropDown = function () {
        this.setState({ visibleDropDown: !this.state.visibleDropDown });
    };
    AnimeStatusBox.prototype.closeDropDown = function () {
        this.setState({ visibleDropDown: false });
    };
    AnimeStatusBox.prototype.fixEpisode = function () {
        this.setState({ currentEpisode: Math.min(this.state.maxEpisodes, Math.max(0, this.state.currentEpisode)) });
    };
    AnimeStatusBox.prototype.increaseEpisode = function () {
        if (this.state.currentEpisode < this.state.maxEpisodes)
            this.setState({ currentEpisode: Math.min(this.state.maxEpisodes, Math.max(0, this.state.currentEpisode + 1)) });
    };
    AnimeStatusBox.prototype.decreaseEpisode = function () {
        if (this.state.currentEpisode > 0)
            this.setState({ currentEpisode: Math.min(this.state.maxEpisodes, Math.max(0, this.state.currentEpisode - 1)) });
    };
    AnimeStatusBox.prototype.setEpisode = function () {
        var num = parseInt(this.input.current.value);
        this.setState({ currentEpisode: num });
    };
    AnimeStatusBox.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return JSON.stringify(this.state) != JSON.stringify(nextState);
    };
    AnimeStatusBox.prototype.saveState = function () {
        this.initState = this.state;
        this.forceUpdate();
    };
    AnimeStatusBox.prototype.render = function () {
        var _this = this;
        var items = Object.keys(eWatchStatus).filter(function (value) { return isNaN(Number(value)) === true; });
        items = items.sort(function (a, b) {
            return +(eWatchStatus[b] == _this.state.currentStatus)
                - +(eWatchStatus[a] == _this.state.currentStatus);
        });
        var sameState = this.initState.currentEpisode == this.state.currentEpisode && this.initState.currentStatus == this.state.currentStatus;
        return (React.createElement("div", { onMouseLeave: this.fixEpisode.bind(this), onMouseEnter: this.fixEpisode.bind(this), className: "statusSelector" },
            React.createElement("div", { className: "statusDropDown" },
                React.createElement("div", { className: "dropDown" + (this.state.visibleDropDown ? ' clicked' : ''), style: { zIndex: 400 }, onClick: this.openDropDown.bind(this), onMouseLeave: this.closeDropDown.bind(this) }, items.map(function (item, i) {
                    return React.createElement("div", { onClick: _this.setStatus.bind(_this, item), className: "item " + item, key: i }, eWatchStatusHumanReadableDisplay(eWatchStatus[item], (malRenewd.frameDoc && malRenewd.frameDoc.location) ? malRenewd.frameDoc.location.pathname.includes("/manga/") : false));
                }))),
            React.createElement("div", { className: "episodeButtons" + (this.state.currentStatus == eWatchStatus.NONE ? ' hidden' : '') },
                React.createElement("div", { onClick: this.decreaseEpisode.bind(this), className: "decrease episodeSelector" + (this.state.currentEpisode <= 0 ? ' inactive' : '') }),
                React.createElement("div", { className: "setvalue episodeSelector" },
                    React.createElement("div", { className: "inner" },
                        React.createElement("input", { ref: this.input, onChange: this.setEpisode.bind(this), type: "number", min: "0", max: this.state.maxEpisodes, value: this.state.currentEpisode }))),
                React.createElement("div", { onClick: this.increaseEpisode.bind(this), className: "increase episodeSelector" + (this.state.currentEpisode >= this.state.maxEpisodes ? ' inactive' : '') })),
            React.createElement("div", { className: "statusDropDown" + (sameState ? ' hidden' : ''), style: { marginTop: '15px' } },
                React.createElement("div", { className: "dropDown flashOver", onClick: this.saveState.bind(this) }, "Update"))));
    };
    return AnimeStatusBox;
}(React.Component));
var AnimeTabList = (function (_super) {
    __extends(AnimeTabList, _super);
    function AnimeTabList(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            currentTab: TabType.Details
        };
        return _this;
    }
    AnimeTabList.prototype.changeTab = function (tab) {
        this.setState({ currentTab: tab });
    };
    AnimeTabList.prototype.render = function () {
        var _this = this;
        return [
            React.createElement("div", { className: "tabs" }, this.props.items.map(function (item, i) { return React.createElement("div", { key: i, onClick: function () { return _this.changeTab.call(_this, TabType[item]); }, className: "item" + (TabType[item] == _this.state.currentTab ? ' selected' : '') }, item); })),
            React.createElement(TabBody, { tab: this.state.currentTab })
        ];
    };
    return AnimeTabList;
}(React.Component));
var ScoreDisplay = (function (_super) {
    __extends(ScoreDisplay, _super);
    function ScoreDisplay(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            number: 0,
            done: false
        };
        return _this;
    }
    ScoreDisplay.prototype.componentDidMount = function () {
        this.countUp.call(this);
    };
    ScoreDisplay.prototype.countUp = function () {
        if (this.state.number + this.props.score / 50 >= this.props.score)
            this.setState({ number: this.props.score, done: true });
        else {
            this.setState({ number: this.state.number + this.props.score / 50 });
            setTimeout(this.countUp.bind(this), 1000 / 25 * (this.state.number / this.props.score + 0.1));
        }
    };
    ScoreDisplay.prototype.render = function () {
        return (React.createElement("div", { className: "scoreDisplay" + (!this.props.animated || this.state.done ? ' show' : '') },
            React.createElement("div", { className: "score" }, this.props.animated ? this.state.number.toFixed(2) : this.props.score.toFixed(2)),
            React.createElement("div", { className: "right" },
                this.props.rank,
                React.createElement("br", null),
                "by ",
                this.props.users,
                " users")));
    };
    return ScoreDisplay;
}(React.Component));
function getScoreFromString(str) {
    var match = str.match(/(\d|\.|\,|\()/g).join('');
    var arr = match.split('(');
    arr[0] = parseFloat(arr[0]);
    return arr;
}
var AnimePage = (function (_super) {
    __extends(AnimePage, _super);
    function AnimePage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { data: null, key: 0 };
        malRenewd.on('iframe_load_complete', function () {
            return setTimeout(function () { return _this.setState({ data: malRenewd.scraper.animepage.getData(), key: Math.random() }); }, 100);
        });
        return _this;
    }
    AnimePage.prototype.componentDidMount = function () {
        var data = malRenewd.scraper.animepage.getData();
        this.setState({ data: data });
        if (data)
            malRenewd.setBackground(data.imageUrl || "");
    };
    AnimePage.prototype.render = function () {
        if (!this.state.data)
            return React.createElement("div", null, "Loading...");
        var scoring = getScoreFromString(this.state.data.information.score);
        return (React.createElement("div", { className: "page animePage", key: this.state.key },
            React.createElement("div", { className: "inner" },
                React.createElement("div", { className: "leftSide" },
                    React.createElement("img", { className: "animeImage", width: "225", height: "319", src: this.state.data.imageUrl || "" }),
                    React.createElement(ScoreDisplay, { animated: true, score: scoring[0] || 0.00, users: scoring[1] || "100", rank: this.state.data.information.ranked || "#0000" }),
                    React.createElement(AnimeStatusBox, null),
                    React.createElement(AnimeInfo, { data: this.state.data.information })),
                React.createElement("div", { className: "rightSide" },
                    React.createElement("div", { className: "info" },
                        React.createElement("div", { className: "titles" },
                            React.createElement("div", { className: "titleBig" }, this.state.data.title),
                            React.createElement("div", { className: "titleSmall" }, this.state.data.information.japanese)),
                        React.createElement("div", { className: "synopsis" }, this.state.data.synopsis),
                        React.createElement(AnimeTabList, { items: Object.keys(TabType).filter(function (value) { return isNaN(Number(value)) === true; }) }))))));
    };
    return AnimePage;
}(React.Component));
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(props) {
        return _super.call(this, props) || this;
    }
    Card.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "card", onClick: function () { return _this.props.url ? malRenewd.navigate(_this.props.url) : ''; } },
            React.createElement("img", { width: "160", height: "220", src: this.props.imageUrl }),
            React.createElement("div", { className: "name" }, this.props.title)));
    };
    return Card;
}(React.Component));
var CardLister = (function (_super) {
    __extends(CardLister, _super);
    function CardLister(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            page: 0
        };
        return _this;
    }
    CardLister.prototype.previousPage = function () {
        if (this.props.floatRight)
            this.setState({ page: this.state.page + 1 });
        else
            this.setState({ page: this.state.page - 1 });
    };
    CardLister.prototype.nextPage = function () {
        if (this.props.floatRight)
            this.setState({ page: this.state.page - 1 });
        else
            this.setState({ page: this.state.page + 1 });
    };
    CardLister.prototype.shouldComponentUpdate = function (nextState) {
        return !nextState.locked;
    };
    CardLister.prototype.render = function () {
        var items = this.props.items;
        var offset = (items.length / this.props.displayCount % 1) * this.props.displayCount;
        if (this.props.cutoff)
            items = items.slice(0, -1 * Math.round(offset));
        var itemMap = items.slice(this.state.page * this.props.displayCount, (this.state.page + 1) * this.props.displayCount);
        malRenewd.setBackground(itemMap[0].imageUrl);
        return (React.createElement("div", { className: "cardlist" + (this.props.floatRight ? ' right' : '') },
            this.props.title ? React.createElement("div", { className: "title" }, this.props.title) : '',
            React.createElement("div", { className: "listHolder", style: { width: (this.props.displayCount * 180 - (this.props.floatRight ? 40 : 40)) + 'px' } },
                (!this.props.floatRight ? this.state.page > 0 : (this.state.page + 1) * this.props.displayCount < items.length) && React.createElement("div", { className: "button buttonLeft", onClick: this.previousPage.bind(this) }),
                React.createElement("div", { className: "list" }, itemMap.map(function (item, i) { return React.createElement(Card, { title: item.title, url: item.url, imageUrl: item.imageUrl, key: Math.random() }); })),
                (this.props.floatRight ? this.state.page > 0 : (this.state.page + 1) * this.props.displayCount < items.length) && React.createElement("div", { className: "button buttonRight", onClick: this.nextPage.bind(this) }))));
    };
    return CardLister;
}(React.Component));
var FrontPage = (function (_super) {
    __extends(FrontPage, _super);
    function FrontPage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: null,
            userData: null
        };
        malRenewd.on('iframe_load_complete', function () { return _this.setState({ userData: malRenewd.scraper.getUserData() }); });
        return _this;
    }
    FrontPage.prototype.componentDidMount = function () {
        this.setState({
            data: {
                suggestions: malRenewd.scraper.frontpage.getSuggestions(),
                newAnime: malRenewd.scraper.frontpage.extractDataFromList('.widget.seasonal')
            },
            userData: malRenewd.scraper.getUserData()
        });
    };
    FrontPage.prototype.render = function () {
        return (React.createElement("div", { className: "page frontpage" },
            this.state.userData ?
                React.createElement("div", { className: "welcomeWrapper" },
                    React.createElement("div", { className: "message" },
                        "Welcome back ",
                        this.state.userData.username),
                    this.state.data && this.state.data.suggestions && React.createElement(CardLister, { locked: this.props.locked, cutoff: true, title: "Here are some anime suggestion", floatRight: true, items: this.state.data.suggestions.map(function (s) { return { url: s.path, imageUrl: s.image, title: s.title }; }), displayCount: 6 })) : "",
            React.createElement("div", { className: "newAnime" },
                React.createElement("div", { className: "message" }, "Summer Anime 2019"),
                this.state.data && this.state.data.newAnime && React.createElement(CardLister, { locked: this.props.locked, cutoff: true, floatRight: false, items: this.state.data.newAnime, displayCount: 6 }))));
    };
    return FrontPage;
}(React.Component));
var PageType;
(function (PageType) {
    PageType[PageType["FRONT"] = 0] = "FRONT";
    PageType[PageType["ANIME"] = 1] = "ANIME";
    PageType[PageType["PROFILE"] = 2] = "PROFILE";
    PageType[PageType["NONE"] = 3] = "NONE";
})(PageType || (PageType = {}));
var LoadingState;
(function (LoadingState) {
    LoadingState[LoadingState["BUSY"] = 0] = "BUSY";
    LoadingState[LoadingState["DONE"] = 1] = "DONE";
})(LoadingState || (LoadingState = {}));
var LoadingBarElement = (function (_super) {
    __extends(LoadingBarElement, _super);
    function LoadingBarElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoadingBarElement.prototype.render = function () {
        return React.createElement("div", { className: "loadingBar" + (this.props.state === LoadingState.BUSY ? " half" :
                this.props.state === LoadingState.DONE ? " done" : "") });
    };
    return LoadingBarElement;
}(React.Component));
var Background = (function (_super) {
    __extends(Background, _super);
    function Background(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            backgroundUrl: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
            newBackgroundUrl: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg',
            fadingBackground: false
        };
        malRenewd.on('full_change_background', function (url) {
            _this.setState({
                fadingBackground: true,
                newBackgroundUrl: url
            });
            setTimeout(function () { return _this.setState({ fadingBackground: false, backgroundUrl: url }); }, 600);
        });
        return _this;
    }
    Background.prototype.render = function () {
        return [
            React.createElement("div", { className: "background" + (this.state.fadingBackground ? ' out' : '') + (this.props.darken ? ' dark' : ''), style: { background: "url(" + this.state.backgroundUrl + ") center/cover no-repeat" } }),
            React.createElement("div", { className: "background" + (this.state.fadingBackground ? ' in' : '') + (this.props.darken ? ' dark' : ''), style: { background: "url(" + this.state.newBackgroundUrl + ") center/cover no-repeat" } }),
        ];
    };
    return Background;
}(React.Component));
var Main = (function (_super) {
    __extends(Main, _super);
    function Main(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            currentPage: PageType.FRONT,
            visibleIframe: false,
            loadingScreen: true,
            loadingBarState: LoadingState.BUSY,
            iframeLoaded: false,
            fullIframe: false
        };
        malRenewd.on('full_nav', function () {
            _this.setState({ loadingBarState: LoadingState.BUSY, iframeLoaded: false });
        });
        return _this;
    }
    Main.prototype.findCurrentPage = function () {
        if (malRenewd.frameDoc.location.pathname.includes("/anime/") || malRenewd.frameDoc.location.pathname.includes("/manga/"))
            return PageType.ANIME;
        if (malRenewd.frameDoc.location.pathname.startsWith("/profile/"))
            return PageType.PROFILE;
        if (malRenewd.frameDoc.location.pathname.startsWith("/animelist/"))
            return PageType.NONE;
        return PageType.FRONT;
    };
    Main.prototype.iframeLoad = function (data) {
        if (this.state.iframeLoaded)
            return;
        var iframe = data.target;
        malRenewd.setIframe(iframe);
        var cPage = this.findCurrentPage();
        this.setState({ fullIframe: cPage == PageType.NONE, currentPage: cPage, loadingScreen: false, iframeLoaded: true, loadingBarState: LoadingState.DONE });
        malRenewd.log('Iframe loaded:', iframe.contentWindow.location.href);
        window.document.title = malRenewd.iframeWindow.document.title;
        if (cPage == PageType.NONE)
            malRenewd.iframeWindow.onunload = function () {
                malRenewd.navigate(malRenewd.iframeWindow.location.href);
                document.head.querySelectorAll('style:not(#css)').forEach(function (e) { return e.parentElement.removeChild(e); });
            };
        if (window.history.state != malRenewd.frameDoc.title)
            window.history.pushState(malRenewd.frameDoc.title, malRenewd.frameDoc.title, malRenewd.frameDoc.location.href);
        malRenewd.emit('iframe_load_complete');
    };
    Main.prototype.render = function () {
        return [
            React.createElement(Background, { darken: this.state.currentPage == PageType.PROFILE }),
            React.createElement(TopBar, { elements: [
                    { name: "Anime" },
                    { name: "Manga" },
                    { name: "Community" },
                    { name: "Industry" },
                    { name: "Watch" },
                    { name: "Store" },
                    { name: "Help" }
                ] }),
            !this.state.loadingScreen && (this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.FRONT && React.createElement(FrontPage, { locked: this.state.loadingBarState != LoadingState.DONE }),
            !this.state.loadingScreen && (this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.ANIME && React.createElement(AnimePage, { locked: this.state.loadingBarState != LoadingState.DONE }),
            !this.state.loadingScreen && (this.state.iframeLoaded || this.state.loadingBarState != LoadingState.DONE) && this.state.currentPage === PageType.PROFILE && React.createElement(ProfilePage, { locked: this.state.loadingBarState != LoadingState.DONE }),
            React.createElement(LoadingBarElement, { state: this.state.loadingBarState }),
            React.createElement("div", { className: "loadingScreen" + (!this.state.loadingScreen ? " done" : "") }),
            React.createElement("iframe", { className: "debug_iframe" + (this.state.fullIframe ? ' full' : ''), style: { display: (this.state.visibleIframe || this.state.fullIframe) ? 'block' : 'none' }, onLoad: this.iframeLoad.bind(this), src: window.location.href, width: "600", height: "400" })
        ];
    };
    return Main;
}(React.Component));
var AnimeStatisticsStack = (function (_super) {
    __extends(AnimeStatisticsStack, _super);
    function AnimeStatisticsStack(props) {
        return _super.call(this, props) || this;
    }
    AnimeStatisticsStack.prototype.render = function () {
        var _this = this;
        var total = this.props.data.reduce(function (acc, curr) { return acc + curr.amount; }, 0);
        if (total <= 0)
            return (React.createElement("div", { className: "dataBox " + this.props.boxId },
                this.props.title && React.createElement("div", { className: "title" }, this.props.title),
                React.createElement("div", { className: "empty" },
                    "This user has no ",
                    this.props.type,
                    " Statistics")));
        return (React.createElement("div", { className: "dataBox " + this.props.boxId },
            this.props.title && React.createElement("div", { className: "title" }, this.props.title),
            this.props.underTitle && React.createElement("div", { className: "title right" },
                React.createElement("div", { className: "days" },
                    this.props.underTitle.days,
                    " Days"),
                React.createElement("div", { className: "mean" },
                    this.props.underTitle.mean,
                    " Mean Score")),
            React.createElement("div", { className: "stack" }, this.props.data.map(function (item, i) {
                return React.createElement("div", { className: eWatchStatus[item.status], key: i, style: { width: item.amount / total * 100 + "%" } },
                    React.createElement("div", { className: "text" },
                        eWatchStatusHumanReadableDisplayAction(item.status, _this.props.type == "Manga"),
                        " ",
                        item.amount,
                        " ",
                        _this.props.type));
            }))));
    };
    return AnimeStatisticsStack;
}(React.Component));
var ProfilePage = (function (_super) {
    __extends(ProfilePage, _super);
    function ProfilePage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: null
        };
        return _this;
    }
    ProfilePage.prototype.componentDidMount = function () {
        var data = malRenewd.scraper.profilepage.getUserData();
        this.setState({ data: data });
        malRenewd.setBackground(data.profileImage);
    };
    ProfilePage.prototype.render = function () {
        if (!this.state.data)
            return React.createElement("div", null, "Loading...");
        var isOnline = this.state.data.statusData.lastOnline == "Now";
        return (React.createElement("div", { className: "page profilePage" },
            React.createElement("div", { className: "inner" },
                React.createElement("div", { className: "leftSide" },
                    React.createElement("img", { className: "userImage", width: "225", height: "225", src: this.state.data.profileImage || "" }),
                    React.createElement("div", { className: "listButtons" },
                        React.createElement("div", null, "Anime List"),
                        React.createElement("div", null, "Manga List")),
                    React.createElement("div", { className: "animeInfo" },
                        React.createElement("div", { id: "link" }, "0 Forum Posts"),
                        React.createElement("div", { id: "link" }, "0 Reviews"),
                        React.createElement("div", { id: "link" }, "0 Recommendations"),
                        React.createElement("div", { id: "link" }, "0 Blog Posts"),
                        React.createElement("div", { id: "link" }, "0 Clubs"))),
                React.createElement("div", { className: "rightSide" },
                    React.createElement("div", { className: "info" },
                        React.createElement("div", { className: "titles" },
                            React.createElement("div", { className: "titleBig" }, this.state.data.profileUserName || ""),
                            React.createElement("div", { className: "titleSmall" },
                                React.createElement("div", { className: "indicator" + (isOnline ? ' online' : ' offline') }),
                                " ",
                                (isOnline ? 'Online' : 'Offline'),
                                " - Joined on ",
                                this.state.data.statusData.joinedDate)),
                        React.createElement("div", { className: "synopsis" }, "No biography yet. Write it now.")),
                    React.createElement("div", { className: "data" },
                        React.createElement(AnimeStatisticsStack, { type: "Anime", boxId: "animeData", title: "Anime Statistics", underTitle: this.state.data.animeExtraData, data: this.state.data.animeStackData }),
                        React.createElement(AnimeStatisticsStack, { type: "Manga", boxId: "mangaData", title: "Manga Statistics", underTitle: this.state.data.mangaExtraData, data: this.state.data.mangaStackData }))))));
    };
    return ProfilePage;
}(React.Component));
var TopBarItem = (function (_super) {
    __extends(TopBarItem, _super);
    function TopBarItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopBarItem.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "button popoutButton" + (this.props.floatRight ? " right" : ""), onClick: function (event) { return _this.props.action(event); } }, this.props.name));
    };
    return TopBarItem;
}(React.Component));
var TopBar = (function (_super) {
    __extends(TopBar, _super);
    function TopBar(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            userData: null
        };
        malRenewd.on('iframe_load_complete', function () { return _this.setState({ userData: malRenewd.scraper.getUserData() }); });
        return _this;
    }
    TopBar.prototype.componentDidMount = function () {
        this.setState({ userData: malRenewd.scraper.getUserData() });
    };
    TopBar.prototype.gotoUserPage = function () {
        malRenewd.navigate("https://myanimelist.net/profile/" + this.state.userData.username);
    };
    TopBar.prototype.render = function () {
        return (React.createElement("nav", null,
            React.createElement("div", { className: "home", onClick: function () { return malRenewd.navigate('https://myanimelist.net/'); } }),
            this.props.elements.map(function (item, i) { return React.createElement(TopBarItem, { floatRight: item.floatRight, action: item.action, name: item.name, key: i }); }),
            React.createElement("div", { className: "button username right popoutButton", onClick: this.gotoUserPage.bind(this) },
                React.createElement("a", { id: "username" }, this.state.userData ? this.state.userData.username : "Login"),
                this.state.userData ? React.createElement("img", { src: this.state.userData.imageUrl }) : "")));
    };
    return TopBar;
}(React.Component));
