class Dish {

    // ratios
    _ratios = ['4:3', '16:9', '1:1', '1:2']

    // default options
    _dish = false
    _conference = false
    _cameras = 0
    _margin = 10
    _aspect = 0
    _video = false;
    _ratio = this.ratio() // to perfomance call here
    _participantList = [];
    _pageMax = 0;
    _maxItemPerPage = 8;
    _curPage = 0;
    _beginIndex = 0;
    _endIndex = 0;

    _trackList = [];
    // create dish
    constructor(scenary) {

        // parent space to render dish
        this._scenary = scenary

        // create the conference and dish
        this.create()

        // render cameras
        // this.render()

        return this;
    }

    // Function for pagination ===============================
    addStreamTrack(pid, track, type, isPlay) {
        console.log("ADDED STREAM TRACK ===");
        console.log(pid);
        console.log(track);
        this._trackList[pid] = {
            track: track,
            type: type,
            isPlay: isPlay
        };
    }

    removeStreamTrack(pid) {
        this._trackList[pid] = null;
    }

    resetDish() {
        this._dish.remove();
        this._dish = document.createElement('div');
        this._dish.classList.add('Dish');
        // append dish to conference
        this._conference.appendChild(this._dish);
    }

    updateIndex(newTotal) {
        this._pageMax = Math.floor(newTotal / this._maxItemPerPage);
        if (newTotal % this._maxItemPerPage == 0)
            -- this._pageMax;
        let backPage = false;
        if (this._curPage > this._pageMax) {
            this._curPage = this._pageMax;
            backPage = true;
        }
        this._beginIndex = this._curPage * this._maxItemPerPage;
        this._endIndex = Math.min(this._participantList.length - 1, (this._curPage + 1) * this._maxItemPerPage - 1);
        if (backPage)
            this.updatePage(this._curPage);
    }

    updatePage(newCurpage) {
        if (newCurpage > this._pageMax || newCurpage < 0)
            return;
        this._curPage = newCurpage;
        this._beginIndex = this._curPage * this._maxItemPerPage;
        this._endIndex = Math.min(this._participantList.length - 1, (this._curPage + 1) * this._maxItemPerPage - 1); 
        this.resetDish();
        for (let i = this._beginIndex; i <= this._endIndex; ++ i) {
            this.addToDish(this._participantList[i].id, this._participantList[i].name, false);
        }
    }
    // =======================================================

    // create Dish
    create() {

        // create conference (dish and screen container)
        this._conference = document.createElement('div');
        this._conference.classList.add('Conference');

        // create dish (cameras container)
        this._dish = document.createElement('div');
        this._dish.classList.add('Dish');

        // append dish to conference
        this._conference.appendChild(this._dish);

    }

    // set dish in scenary
    append() {

        // append to scenary
        this._scenary.appendChild(this._conference);

    }

    // calculate dimensions
    dimensions() {
        this._width = this._dish.offsetWidth - (this._margin * 2);
        this._height = this._dish.offsetHeight - (this._margin * 2);
        if (this._width <= 0) {
            this._width = Math.floor(document.documentElement.clientWidth * 0.75); 
        }
        if (this._height <= 0) {
            this._height = Math.floor(document.documentElement.clientHeight * 0.85)
        }
    }


    // resizer of cameras
    resizer(width) {

        for (var s = 0; s < this._dish.children.length; s++) {

            // camera fron dish (div without class)
            let element = this._dish.children[s];

            // custom margin
            element.style.margin = this._margin + "px"

            // calculate dimensions
            element.style.width = width + "px"
            element.style.height = (width * this._ratio) + "px"

            // to show the aspect ratio in demo (optional)
            element.setAttribute('data-aspect', this._participantList[s + this._curPage * this._maxItemPerPage].name);
        }
    }

    resize() {

        // get dimensions of dish
        this.dimensions()


        // loop (i recommend you optimize this)
        let max = 0
        let i = 1
        while (i < 5000) {
            let area = this.area(i);
            if (area === false) {
                max = i - 1;
                break;
            }
            i++;
        }

        // remove margins
        max = max - (this._margin * 2);

        // set dimensions to all cameras
        console.log("RESIZER =============================");
        console.log(max);
        this.resizer(max);
    }

    // split aspect ratio (format n:n)
    ratio() {
        var ratio = this._ratios[this._aspect].split(":");
        return ratio[1] / ratio[0];
    }

    // calculate area of dish:
    area(increment) {

        let i = 0;
        let w = 0;
        let h = increment * this._ratio + (this._margin * 2);
        while (i < (this._dish.children.length)) {
            if ((w + increment) > this._width) {
                w = 0;
                h = h + (increment * this._ratio) + (this._margin * 2);
            }
            w = w + increment + (this._margin * 2);
            i++;
        }
        if (h > this._height || increment > this._width) return false;
        else return increment;

    }

    masterAdd(pid, name) {
        this._participantList.push({
            id: pid,
            name: name
        });
        this.updateIndex(this._participantList.length);
    }
    masterRemove(pid) {
        for( var i = 0; i < this._participantList.length; i ++) { 
            if ( this._participantList[i].id == pid) { 
                this._participantList.splice(i, 1); 
                break;
            }
        };
        this.updateIndex(this._participantList.length);
    }

    findParticipantOnCurDish(pid) {
        for (let i = this._beginIndex; i <= this._endIndex; ++ i) {
            if (this._participantList[i].id == pid)
                return i;
        }
        return -1;
    }

    swapParticipantOnMaster(i, j) {
        let tmp = this._participantList[i];
        this._participantList[i] = this._participantList[j];
        this._participantList[j] = tmp;
    }

    findParticipantPos(pid) {
        for (let i = 0; i <= this._participantList.length - 1; ++ i) {
            if (this._participantList[i].id == pid)
                return i;
        }
    }

    join(pid, name) {
        if (this._endIndex - this._beginIndex + 1 >= this._maxItemPerPage) {
            this.masterAdd(pid, name);
        } else {
            this.masterAdd(pid, name);
            this.addToDish(pid, name, false);
        }
    }

    

    left(pid) {
        // console.log("RUN LEFT FOR" + pid);

        if (this._endIndex - this._beginIndex + 1 == this._maxItemPerPage) {
            let posParticipantOnCurDish = this.findParticipantOnCurDish(pid);
            if (posParticipantOnCurDish != -1) {
                if (this._curPage == this._pageMax) {
                //     console.log("CURR========================")
                //     console.log(this._curPage);
                //     console.log(this._pageMax);
                    this.removeToDish(pid, true);
                } else { 
                    // console.log("BEGIN REMOVE---");
                    // console.log(pid);
                    this.removeToDish(pid, false);
                    // console.log("START ADDING .....");
                    let posOfThisParticipantID = this.findParticipantPos(pid);
                    let newInfo = this._participantList[this._participantList.length - 1];
                    // console.log(posOfThisParticipantID);
                    // console.log(newInfo);
                    this.swapParticipantOnMaster(posOfThisParticipantID, this._participantList.length - 1);
                    this.addToDish(newInfo.id, newInfo.name, false);
                    this.masterRemove(pid);
                    
                    
                    
                }
            } else {
                if (this._curPage == this._pageMax) {
                    let leftParticipantPos = this.findParticipantPos(pid);
                    this.removeToDish(this._participantList[this._endIndex].id, false);
                    this.swapParticipantOnMaster(leftParticipantPos, this._participantList.length - 1);
                    this.masterRemove(pid);
                } else {
                    let leftParticipantPos = this.findParticipantPos(pid);
                    this.swapParticipantOnMaster(leftParticipantPos, this._participantList.length - 1);
                    this.masterRemove(pid);
                }
            }
        } else {
            let posParticipantOnCurDish = this.findParticipantOnCurDish(pid);
            if (posParticipantOnCurDish != -1) {
                this.removeToDish(pid, true);
            } else {
                let leftParticipantPos = this.findParticipantPos(pid);
                this.removeToDish(this._participantList[this._participantList.length - 1].id);
                this.swapParticipantOnMaster(leftParticipantPos, this._endIndex);
                this.masterRemove(pid);
            }
        }
    }

    addToDish(pid, name, addToMaster) {
        if (addToMaster)
            this.masterAdd(pid, name);
        this._cameras++;
        // this.render();
        let cameraDiv = document.createElement('div')
        cameraDiv.setAttribute('id', `participant-${pid}`);
        this._dish.appendChild(cameraDiv);
        this.resize();
        this.video(this._dish.children.length - 1);
    }

    removeToDish(pid, removeToMaster) {
        let participantDiv = this._dish.querySelector(`#participant-${pid}`);
        participantDiv.remove();
        if (removeToMaster)
            this.masterRemove(pid);
        this._cameras--;
        this.resize();
    }


    // return ratios
    ratios() {
        return this._ratios;
    }

    // return cameras
    cameras() {
        return this._cameras;
    }

    // set ratio
    aspect(i) {
        this._aspect = i;
        this._ratio = this.ratio()
        this.resize();
    }

    // set screen scenary
    expand() {

        // detect screen exist
        let screens = this._conference.querySelector('.Screen');
        if (screens) {

            // remove screen
            this._conference.removeChild(screens);

        } else {

            // add div to scenary
            let screen = document.createElement('div');
            screen.classList.add('Screen');
            // append first to scenary
            this._conference.prepend(screen);

        }
        this.resize();
    }

    video(camera, callback, hide = false) { 
        let indexOnDish = camera % this._maxItemPerPage;
        // check have video
        if (this._dish.children[indexOnDish].video) {
            if (hide) {
                // delete video:
                this._dish.children[indexOnDish].video = false
                let videos = this._dish.children[indexOnDish].querySelectorAll('video');
                this._dish.children[indexOnDish].removeChild(videos[0]);
            }
        } else {
            // set video
            this._dish.children[indexOnDish].video = true

            let id = this._participantList[camera + this._curPage * this._maxItemPerPage].id;
            let name = this._participantList[camera + this._curPage * this._maxItemPerPage].name;

            
            let video = document.createElement('video');
            console.log("VIDEO =================");
            console.log(id);
            console.log(name);
            video.setAttribute('id', `participant-${id}-video`)
            video.poster = '../images/person-icon-12.jpg'
            video.autoplay = true;
            video.muted = true;
            video.playsinline = true;
            video.controls = true;

            let audio = document.createElement('audio');
            audio.setAttribute('id', `participant-${id}-audio`)
            audio.autoplay = true;
            audio.playsinline = true;
            console.log("TEST TRACK ========================");
            console.log(this._trackList[id]);
            if (this._trackList[id] != null) {
                let isPlay = this._trackList[id].isPlay;
                let track = this._trackList[id].track;
                let type = this._trackList[id].type;
                let mediaStream = new MediaStream([track]);
                if (isPlay) {
                    if (type == 'video') {
                        video.srcObject = mediaStream;
                        video.play();
                    }
                    if (type == 'audio') {
                        audio.srcObject = mediaStream;
                        audio.play();
                    }
                } else {
                    video.srcObject = mediaStream;
                }
            }
            
            this._dish.children[indexOnDish].append(video, audio);
        }
    }
}