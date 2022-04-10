const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "F8_PLAYER"
const player = $('.player')
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [{
            name: 'BlindingLinght',
            singer: 'TheWeekend',
            path: "./access/music/song1.mp3",
            image: "./access/img/song1.jpg"
        },
        {
            name: 'DarkSide',
            singer: 'AlanWalker',
            path: "./access/music/song2.mp3",
            image: "./access/img/song2.jpg"
        },
        {
            name: 'LemonTree',
            singer: 'FoolsGarden',
            path: "./access/music/song3.mp3",
            image: "./access/img/song3.jpg"
        },
        {
            name: 'Modony',
            singer: 'TheFatLauren',
            path: "./access/music/song4.mp3",
            image: "./access/img/song4.jpg"
        },
        {
            name: 'Nevada',
            singer: 'Monstercat',
            path: "./access/music/song5.mp3",
            image: "./access/img/song5.jpg"
        },
        {
            name: 'OutSide',
            singer: 'CalvinHarris',
            path: "./access/music/song6.mp3",
            image: "./access/img/song6.jpg"
        },
        {
            name: 'SaveYourTea',
            singer: 'TheWeekend',
            path: "./access/music/song7.mp3",
            image: "./access/img/song7.jpg"
        },
        {
            name: 'SummmerTime',
            singer: 'K391',
            path: "./access/music/song8.mp3",
            image: "./access/img/song8.jpg"
        },
        {
            name: 'TakeMeToChurch',
            singer: 'Hozier',
            path: "./access/music/song9.mp3",
            image: "./access/img/song9.jpg"
        },
        {
            name: 'Unstoppable',
            singer: 'Sia',
            path: "./access/music/song10.mp3",
            image: "./access/img/song10.jpg"
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    defineproperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];

            }
        })
    },



    render: function() {
        const htmls = this.songs.map(function(song, index) {
            return `
                <div class="song  ${index === app.currentIndex ? 'active' :''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                `
        });
        playlist.innerHTML = htmls.join('');

    },


    handleEvents: function() {
        // xử lí phóng to, thu nhỏ của CD
        const cdWidth = cd.offsetWidth;
        const _this = this;
        document.onscroll = function(e) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newcdWidth = cdWidth - scrollTop;
            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
            cd.style.opacity = newcdWidth / cdWidth;
        };
        // xử lí khi click play
        playBtn.onclick = function() {
                if (_this.isPlaying) {
                    audio.pause();

                } else {
                    audio.play();
                }
                audio.onplay = function() {
                    _this.isPlaying = true;
                    player.classList.add('playing');
                    cdThumbAnimate.play();
                }
                audio.onpause = function() {
                    _this.isPlaying = false;
                    player.classList.remove('playing');
                    cdThumbAnimate.pause();

                }
            }
            // xử lí khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        };
        //  xử lí tua audio
        progress.oninput = function(e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        };
        // xử lí quay CD thumb
        const cdThumbAnimate = cdThumb.animate([
            // keyframes
            { transform: 'rotate(360deg)' }
        ], {
            // timing options
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();
        // Xử lí khi click next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();

            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        // Xử lí khi click prev song
        prevBtn.onclick = function() {

            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        // xử lí bật tắt random bài hát
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        };
        // xử lí bật tắt repeat
        repeatBtn.onclick = function() {
                _this.isRepeat = !_this.isRepeat;
                repeatBtn.classList.toggle('active', _this.isRepeat);
                _this.setConfig("isRepeat", _this.isRepeat)
            }
            // xử lí next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {

                nextBtn.click();
            }
        };
        //  Lắng nghe hành vi click vào bài hát

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();

                }
            }
        };

    },
    //  Tải bài hát hiện tại
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    // tải lại cấu hình
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    //  Xử lí khi bấm next bài hát 
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length - 1) {
            this.currentIndex = 0;
        };
        this.loadCurrentSong();

    },
    //  Xử lí khi bấm prev bài hát 

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        };
        this.loadCurrentSong();

    },
    // random song ngẫu nhiên
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center"
            });

        }, 300);
    },

    start: function() {
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
        // Định nghĩa các thuộc tính cho Object
        this.defineproperties();
        //  Render lại giao diện
        this.render();
        //  Lắng nghe và xử lí các sự kiện.
        this.handleEvents();
        this.loadCurrentSong();
        //  hiển thị trạng thái ban đầu button random và repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }


}



app.start()