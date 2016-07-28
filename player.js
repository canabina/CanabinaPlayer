(() =>
{

    function player()
    {

        let variables = {
                conf:
                {
                    playAfterInit: false,
                    trackList: [],
                    volume: 1,
                    onPlay: () =>
                    {},
                    onPlaying: () =>
                    {},
                    onEnded: () =>
                    {},
                    onLoadStart: () =>
                    {},
                    onPause: () =>
                    {},
                    autoPlay: true,
                    shuffle: false,
                    loop: false,
                },
            },
            self = this;
        this.audioContext;
        this.trackList;
        this.currentTrack = {};
        this.init = (selector, conf) =>
        {
            if (selector)
            {
                variables.playerDocoumentObj = document.querySelector(selector);
                variables.conf = Object.assign(variables.conf, conf);
                if (!this.helpers.isEmpty(variables.playerDocoumentObj))
                {
                    _buildPlayer();
                    return new _methods();
                }
            }
            else
                throw new('Empty selector');
        }

        this.helpers = {
            isEmpty: (obj) =>
            {
                return Object.keys(obj)
                    .length === 0 && obj.constructor === Object
            },

            each: (object, callback) =>
            {
                for (let i = 0; i < object.length; i++)
                {
                    callback(i, object[i]);
                }
            },

            hasClass: (element, className) =>
            {
                let res = false;
                self.helpers.each(element.classList, (index, val) =>
                {
                    if (val == className)
                        res = true;
                });
                return res;
            },

            getTime: (sec) =>
            {
                let sec_num = parseInt(sec, 10);
                let hours = Math.floor(sec_num / 3600);
                let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                let seconds = sec_num - (hours * 3600) - (minutes * 60);
                if (hours < 10)
                {
                    hours = "0" + hours;
                }
                if (minutes < 10)
                {
                    minutes = "0" + minutes;
                }
                if (seconds < 10)
                {
                    seconds = "0" + seconds;
                }
                return minutes + ':' + seconds;
            },

            shuffleArray: (array) =>
            {
                var currentIndex = array.length,
                    temporaryValue, randomIndex;
                while (0 !== currentIndex)
                {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }
        }

        function _buildPlayer()
        {
            let playerTemplate = "<div class='CPControlls'>" +
                "<div class='CPControllsTrack CPPrev'>prev</div>" +
                "<div class='CPButton CPPlay__pause'>Play</div>" +
                "<div class='CPControllsTrack CPNext'>next</div>" +
                "</div>" +
                "<div class='CPProgressBar'>" +
                "<span class='CPProgressBarLine'></span>" +
                "<span class='CPTimeToLeft'></span>" +
                "<span class='CPProgressBarOverlay'></span>" +
                "</div>" +
                "<div class='CPInfoBar'>" +
                "<span class='CPArtist'></span>" +
                "<span class='CPTrackName'></span>" +
                "<span class='CPTimeLenght'></span>" +
                "</div>" +
                "<audio class='CPAudioElement'></audio>";

            variables.playerDocoumentObj.classList.add('CPWrapper');
            variables.playerDocoumentObj.innerHTML = playerTemplate;
            _loadAudioApi();
            _eventsListener();
        }


        function _loadAudioApi()
        {
            self.audioContext = document.querySelector('.CPAudioElement');
            self.trackList = variables.conf.trackList;
            if (variables.conf.shuffle)
            {
                _shuffleTrackList();
            }
            _setNewTrackById(Object.keys(self.trackList)[0]);
            self.audioContext.volume = variables.conf.volume;
            _beforeFirstPlay();
            self.audioContext.ontimeupdate = () =>
            {
                _onPlay();
            }
            self.audioContext.onplaying = () =>
            {
                _onPlaying();
            }
            self.audioContext.onended = () =>
            {
                _onEnded();
            }
            self.audioContext.onloadstart = () =>
            {
                _onLoadStart();
            }
            self.audioContext.onpause = () =>
            {
                _onPause();
            }
            if (variables.conf.autoPlay)
            {
                self.audioContext.onended = () =>
                {
                    _playNextOrPrevTrack(false);
                }
            }
            if (variables.conf.playAfterInit)
            {
                _play();
            }
        }


        function _beforeFirstPlay()
        {
            variables.progressLine = document.querySelector('.CPProgressBarLine');
            variables.widthWrapperLine = document.querySelector('.CPProgressBar')
                .offsetWidth;
        }

        function _methods()
        {
            this.shuffle = () =>
            {
                _shuffleTrackList();
                _playTrackById(0);
            }

            this.setVolume = (value) =>
            {
                if (value && value <= 1)
                {
                    _setVolume(value);
                }
            }

            this.playNext = () =>
            {
                _playNextOrPrevTrack(false);
            }

            this.playPrev = () =>
            {
                _playNextOrPrevTrack(true);
            }

            this.push = (items) =>
            {
                _addItemsToTrackList(items);
            }

            this.remove = (id, restart) =>
            {
                if (id !== false)
                {
                    _removeTrackFromTrackListById(id, restart);
                }
            }

            this.playTrackById = (id) =>
            {
                _playTrackById(id);
            }

            this.pause = () =>
            {
                _stop();
            }

            this.play = () =>
            {
                _play();
            }

            this.setCurrentTimeTrack = (seconds) =>
            {
                _setCurrentTrackTime(seconds);
            }
        }

        function _setVolume(value)
        {
            self.audioContext.volume = value;
        }

        function _shuffleTrackList()
        {
            self.trackList = self.helpers.shuffleArray(self.trackList);
        }

        function _removeTrackFromTrackListById(id, restart)
        {
            self.trackList.splice(id, 1);
            if (restart && self.currentTrack.obj.id == id)
            {
                let id = _getNextOrPrewId(false);
                id--;
                _playTrackById(id);
            }
        }

        function _addItemsToTrackList(items)
        {
            self.trackList = self.trackList.concat(items);
        }

        function _onPlay()
        {
            variables.conf.onPlay(self.audioContext.currentTime);
            _changeProgressBar();
            _setTimeToLeft();
        }

        function _onPlaying()
        {
            variables.conf.onPlaying();
        }

        function _onPause()
        {
            variables.conf.onPause();
        }

        function _onEnded()
        {
            variables.conf.onEnded();
        }

        function _onLoadStart()
        {
            variables.conf.onLoadStart();
        }

        function _play()
        {
            self.audioContext.play();
        }

        function _stop()
        {
            self.audioContext.pause();
        }

        function _changeProgressBar()
        {
            let perceange = (self.audioContext.currentTime / _getCurrentTrackDuration()) * 100;
            variables.progressLine.style.width = perceange + '%';
        }

        function _setCurrentTrackTime(seconds)
        {
            self.audioContext.currentTime = seconds;
        }

        function _changeCurrentTimeByClickOnProgressBar(pos, element)
        {
            let perceange = (pos / element.offsetWidth) * 100;
            _setCurrentTrackTime((_getCurrentTrackDuration() / 100) * perceange);
            _changeProgressBar();
        }

        function _setTimeToLeft()
        {
            let currentTime = self
                .helpers
                .getTime(
                    Math.round(
                        self.audioContext.currentTime
                    )
                );

            document.querySelector('.CPTimeToLeft')
                .innerHTML = currentTime;
        }

        function _getNextOrPrewId(vector)
        {
            let newId = self.currentTrack.obj.id;
            vector ? newId-- : newId++;
            if (newId >= 0 && self.trackList[newId])
            {
                return newId;
            }
            else if (newId >= 0 && variables.conf.loop)
                return 0;
            return false;
        }

        function _playNextOrPrevTrack(vector)
        {
            let id = _getNextOrPrewId(vector);
            if (id !== false)
            {
                _playTrackById(id);
            }
        }

        function _setNewTrackById(id)
        {
            self.currentTrack.obj = self.trackList[id];
            self.currentTrack.obj.id = id;
            self.audioContext.src = self.currentTrack.obj.url;
            self.audioContext.load();
            _setInfoByTrack();
        }

        function _playTrackById(id)
        {
            _stop();
            _setNewTrackById(id);
            _play();
        }

        function _playOrPause()
        {
            self.audioContext.paused ? _play() : _stop();
        }

        function _getCurrentTrackDuration()
        {
            while (!isNaN(self.audioContext.duration))
            {
                return self.audioContext.duration;
            }
        }

        function _setInfoByTrack()
        {
            document.querySelector('.CPArtist')
                .innerHTML = self.currentTrack.obj.artist;
            document.querySelector('.CPTrackName')
                .innerHTML = self.currentTrack.obj.name;
            // document.querySelector('.CPTimeLenght').innerHTML = _getCurrentTrackDuration();
        }

        function _eventsListener()
        {

            let controlls = document.querySelectorAll('.CPControllsTrack');
            for (let i = 0; i < controlls.length; i++)
            {
                controlls[i].addEventListener('click', (event) =>
                {
                    _playNextOrPrevTrack(
                        self
                        .helpers
                        .hasClass(
                            event.target,
                            'CPPrev'
                        )
                    );
                });
            }
            document.querySelector('.CPPlay__pause')
                .addEventListener('click', (event) =>
                {
                    _playOrPause();
                });

            document.querySelector('.CPProgressBarOverlay')
                .addEventListener('click', (event) =>
                {
                    _changeCurrentTimeByClickOnProgressBar(event.offsetX, event.target);
                });

        }
    }

    window.CanabinaPlayer = new player;

})();
