
const Carousel = (galleryContainerClass, linksContainerClass = null) => {
    const galleryContainer = document.querySelector(`.${galleryContainerClass}`)
    if (!galleryContainer) return

    const carouselContainer = galleryContainer.querySelector('.js-image-carousel')
    const controlsContainer = galleryContainer.querySelector('.js-gallery-controls')
    const imagesList = carouselContainer.children
    const linksContainer = linksContainerClass && document.querySelector(`.${linksContainerClass}`)
    const linksList = linksContainer?.children
    const minMobileWidth = 810

    let nextButton
    let prevButton
    let startButton 
    let fullscreenButton 
    let captionsButton 
    let helpButton 

    if (controlsContainer) {
        nextButton = controlsContainer.querySelector('.js-next-button')
        prevButton = controlsContainer.querySelector('.js-prev-button')
        startButton = controlsContainer.querySelector('.js-start-button')
        fullscreenButton = controlsContainer.querySelector('.js-fullscreen')
        captionsButton = controlsContainer.querySelector('.js-display-captions')
        helpButton = controlsContainer.querySelector('.js-display-help')
    }

    const state = {
        isFirstPlay: true,
        isPlaying: false,
        isFullscreen: false,
        isCaptions: false,
        isHelp: false,
        curIndex: 0,
        carouselTimer: null,
        controlsTimer: null,
        helpTimer: null,
        interval: carouselContainer.dataset.interval || 5000,
        controlsInterval: 2500,
        playOnce: carouselContainer.dataset.playOnce || false,
        imageCounter: carouselContainer.dataset.imageCounter || true,
    }

    const start = () => {
        /** Show next image on play, unless the gallery has just loaded */
        if (!state.isFirstPlay) {
            next()
        } else if (state.isFirstPlay) {
            /** Init gallery on first play */
            init()
        }

        state.carouselTimer = setInterval(() => {
            setImage((state.curIndex + 1) % imagesList.length)
            if (state.playOnce === "true" && state.curIndex === imagesList.length - 1) {
                stop()
            }
        }, state.interval)
        if (controlsContainer) {
            startButton.firstChild.innerHTML = 'stop'
            toggleControls()
        }
        state.isPlaying = true;
    }

    const init = () => {
        state.isFirstPlay = false
        setFirstImageAsCurrent()
        updateMobileImageEvents()
        updateImageCounter()
    }

    setFirstImageAsCurrent = () => {
        imagesList[0].classList.add('current')
    }

    const stop = () => {
        clearInterval(state.carouselTimer);
        state.carouselTimer = null;
        state.isPlaying = false;
        if (controlsContainer) startButton.firstChild.innerHTML = 'play_arrow'
    }

    const next = () => {
        stop()
        setImage((state.curIndex + 1) % imagesList.length)
    }

    const prev = () => {
        stop()
        setImage((state.curIndex - 1 + imagesList.length) % imagesList.length)
    }

    const togglePlay = () => {
        if (state.isPlaying) {
            stop()
        } else {
            start()
        }
    }

    const toggleFullscreen = () => {
        galleryContainer.classList.toggle('fullscreen')
        state.isFullscreen = !state.isFullscreen
        if (!fullscreenButton) return
        fullscreenButton.firstChild.innerHTML = state.isFullscreen ? 'fullscreen_exit' : 'fullscreen'
    }

    const toggleCaptions = () => {
        carouselContainer.classList.toggle('show-captions')
        state.isCaptions = !state.isCaptions
    }

    const toggleHelp = () => {
        galleryContainer.classList.toggle('show-help')
        state.isHelp = !state.isHelp
    }

    const toggleControls = () => {
        galleryContainer.classList.add('show-controls')
        clearTimeout(state.controlsTimer)
        state.controlsTimer = setTimeout(() => {
            galleryContainer.classList.remove('show-controls')
            galleryContainer.classList.remove('show-help')
        }, state.controlsInterval)
    }

    const setImage = (newIndex) => {
        imagesList[state.curIndex].classList.remove('current')
        linksList?.[state.curIndex]?.classList.remove('current')
        state.curIndex = newIndex
        imagesList[state.curIndex].classList.add('current')
        linksList?.[state.curIndex]?.classList.add('current')
        updateMobileImageEvents()
        updateImageCounter()
    }

    const updateImageCounter = () => {
        if (state.imageCounter === "false") return
        const curImageContainer = 
            carouselContainer.querySelector('.current figure')
            || carouselContainer.querySelector('.current')
        let curImageCounter = curImageContainer.querySelector('.image-counter')
        if (curImageCounter) return

        curImageCounter = document.createElement('div')
        curImageCounter.classList.add('image-counter')
        curImageCounter.innerHTML = `${state.curIndex + 1} / ${imagesList.length}`
        curImageContainer.prepend(curImageCounter)
    }

    const updateMobileImageEvents = () => {
        if (window.innerWidth > minMobileWidth) return
        const prevImage = imagesList.item((state.curIndex - 1 + imagesList.length) % imagesList.length)
        const curImage = imagesList.item(state.curIndex)
        prevImage.querySelector('img').removeEventListener('mousedown', mobileImageEvents)
        curImage.querySelector('img').addEventListener('mousedown', mobileImageEvents)
    }

    /** mobile fullscreen events */
    const mobileImageEvents = (event) => {
        if (window.innerWidth > minMobileWidth) return

        const clientWidthQuarter = window.innerWidth / 4
        const x = event.clientX
        const y = event.clientY
        if (x < clientWidthQuarter) {
            prev()
        } else if (x > clientWidthQuarter * 3) {
            next()
        } else {
            toggleFullscreen()
        }
    }

    if (controlsContainer) {
        /** Event handlers */
        nextButton.addEventListener('click', next)
        prevButton.addEventListener('click', prev)
        startButton.addEventListener('click', togglePlay)
        fullscreenButton.addEventListener('click', toggleFullscreen)
        helpButton.addEventListener('click', toggleHelp)
        captionsButton?.addEventListener('click', toggleCaptions)
        /** keyboard shortcuts */
        document.addEventListener('keydown', (event) => {
            toggleControls()
            event.key === 'ArrowRight' && next()
            event.key === 'ArrowLeft' && prev()
            event.key === ' ' && togglePlay()
            event.key === 'f' && toggleFullscreen()
            event.key === 'h' && toggleHelp()
            captionsButton && event.key === 'i' && toggleCaptions()
        })
        /** mouse events */
        document.addEventListener('mousemove', toggleControls)
    }

    return {
        start
    }
}
