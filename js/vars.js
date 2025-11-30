var vars = {
    version: "1.0.2",
    title: "XEMU Compatibility List",

    fileToLoad: 'xemu_compat_list_20251126.json',
    availableGames: [],
    list: [],

    colours: {
        perfect:    'rgba( 27, 135, 153, 0.85)',
        playable:   'rgba( 66, 153,  27, 0.85)',
        starts:     'rgba(255, 152,   0, 0.85)',
        intro:      'rgba(248, 102,  36, 0.85)',
        broken:     'rgba(215,  38,  61, 0.85)'
    },

    init: ()=> {
        document.title = `${vars.title} v${vars.version}`;
        vars._addEventListeners();
        vars._loadList();

        vars._getCurrentIP();
        vars._getLatestVersionFromLiveSite();
        vars._getExeVersion(); // get the version of xemu installed locally
        vars._downloadAnyMissingImages();

        vars.initLetterSelection();
        vars.initStatusLegend();
    },

    _addEventListeners: ()=> {
        window.addEventListener('scroll', ()=> {
            vars.repositionImageContainer();
        });
    },

    _downloadAnyMissingImages: ()=> {
        console.log(`%cChecking for missing images to download...`, 'color: orange; font-weight: bold;');
        fetch('./downloadAllImages.php')
        .then(response => response.json())
        .then(data => {
            if (data.failed>0) {
                console.error(`Failed to download ${data.failed} images. See server logs for details.`);
                return;
            };
            console.log('%cMissing Images Response: NO FAILED DOWNLOADS', 'color: orange; font-weight: bold;');
        })
        .catch(error => console.error('Error downloading missing images:', error));
    },

    _getAvailableGames: ()=> {
        fetch('./getAvailableGames.php')
        .then(response => response.json())
        .then(data => {
            let availableGames = vars.availableGames = data;
            console.log(`%c${availableGames.length} games available in xemu games folder\n  > Highlighting the games we've found.`, 'color: #30ff30; font-weight: bold;');
            vars.highlightGamesOnDrive();
            vars.addManualIconsToAvailableGames();
            
            vars.repositionImageContainer();
            vars.resizeTable();
        })
        .catch(error => console.error('Error fetching available games:', error));
    },

    _getCurrentIP: ()=> {
        fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => { 
            vars.currentIP = data.ip;
            // hide the last three octets for privacy
            let ipParts = vars.currentIP.split('.');
            ipParts[2] = 'xxx';
            ipParts[3] = 'xxx';
            vars.currentIP = ipParts.join('.');
            document.getElementById('currentIP').innerText = vars.currentIP;
        })
        .catch(error => console.error('Error fetching current IP address:', error));
    },

    _getExeVersion: ()=> {
        fetch('./getXemuVersion.php')
        .then(response => response.json())
        .then(data => {
            vars.xemuExeVersion = data.xemu_version;
            document.getElementById('exeVersion').innerHTML = ` | XEMU EXE Version: ${vars.xemuExeVersion}`;
        })
        .catch(error => console.error('Error fetching xemu version:', error));
    },

    _getLatestVersionFromLiveSite: ()=> {
        fetch('./getLatestVersionNumberFromLiveSite.php')
        .then(response => response.json())
        .then(data => {
            document.getElementById('onlineVersion').innerHTML += `Latest ${data.version} | <a href="https://github.com/xemu-project/xemu/releases/latest/download/xemu-win-x86_64-release.zip">Download <i class="fa-solid fa-download"></i></a> | <a target="_blank" href="https://vimm.net/vault/Xbox">Get Games <i class="fa-solid fa-cloud-arrow-down"></i></a>`;
        })
        .catch(error => console.error('Error fetching latest version:', error));
    },

    _loadList: ()=> {
        fetch(vars.fileToLoad)
        .then(response => response.json())
        .then(data => {
            vars.buildGameList(data);
            vars._getAvailableGames(); // these are my games that are available in the games folder for xemu
        })
        .catch(error => console.error('Error loading the list:', error));
    },

    initLetterSelection: ()=> {
        let html = `<div class="letter" onpointerdown="vars.searchByFirstLetter('available',this);">AVAILABLE</div>\n`;
        html += `<div class="letter letterSelected" onpointerdown="vars.searchByFirstLetter('',this);">ALL</div>\n`;
        html += `<div class="letter" onpointerdown="vars.searchByFirstLetter('#',this);">#</div>\n`

        for (let i=65; i<65+26; i++) {
            let letter = String.fromCharCode(i);
            html += `<div class="letter" onpointerdown="vars.searchByFirstLetter('${letter}',this);">${letter}</div>\n`;
        };

        document.getElementById('letterSelection').innerHTML = html;
    },

    initStatusLegend: ()=> {
        let html = '';
        for (const [status, colour] of Object.entries(vars.colours)) {
            let sCap = status.capitalise();
            html += `<div class="legendItem" onpointerdown="vars.searchByStatus('${status}')"><div id="status${sCap}" class="legendText" style="background-color: ${colour}">${sCap}</div></div>\n`;
        };

        document.getElementById('statusLegend').innerHTML = html;
    },

    addManualIconsToAvailableGames: ()=> {
        vars.availableGames.forEach(g=> {
            if (!g.manual) return;

            let imagesrc = g.image;
            let div = [...document.querySelectorAll(`tr[data-image="./cache/${imagesrc}"]`)];
            if (!div.length) return;

            let firstTD = div[0];
            let child = firstTD.children[0];
            child.innerHTML += `<i title="Manual" class="fa-solid fa-book" style="margin-left: 16px;" onpointerup="vars.showManualContainer(true, '${g.title.replaceAll(/'/g, '\\\'')}')"></i>`;
        });
    },

    buildGameList: (data)=> {
        let list = vars.list = data; // cache the list
        arraySortByKey(vars.list,'title');

        let container = document.getElementById('listContainer');
        let table = `<table id="gameListTable" border="1">
            <tr id="totalCount"><td colspan="2">0 results found</td></tr>
            <tr><th>Game Title</th><th style="text-align: center">Status</th></tr>`;
        
        let regex = /[^A-Za-z0-9._-]/g;
        let typeCounts = vars.counts = {
            _total: list.length,
            broken: 0,
            intro: 0,
            starts: 0,
            playable: 0,
            perfect: 0
        };

        list.forEach(item => {
            typeCounts[item.status.toLowerCase()] += 1;
            let imageSrc = item.title.replace(regex, '_');
            table += `<tr class="title" data-title="${vars.simplifyTitle(item.title)}" data-status="${item.status.toLowerCase()}" data-image="./cache/${imageSrc}.jpg" data-found-on-drive="false" onmouseenter="vars.showImage(this.dataset.image);">
                        <td>${item.title}</td>
                        <td style="width: 200px; text-align: center; color: white; font-weight: bold; background-color: ${vars.colours[item.status.toLowerCase()]}">${item.status}</td>
                        </tr>`;
        });
        table += '</table>';
        typeCounts.percentages = {
            broken: ((typeCounts.broken / typeCounts._total) * 100).toFixed(1)*1,
            intro: ((typeCounts.intro / typeCounts._total) * 100).toFixed(1)*1,
            starts: ((typeCounts.starts / typeCounts._total) * 100).toFixed(1)*1,
            playable: ((typeCounts.playable / typeCounts._total) * 100).toFixed(1)*1,
            perfect: ((typeCounts.perfect / typeCounts._total) * 100).toFixed(1)*1
        };

        container.innerHTML = table;

        vars.updateButtonWithPercentages();

        setTimeout(()=> {
            vars.updateCountText(list.length);
        }, 0);
    },

    highlightGamesOnDrive: ()=> {
        vars.availableGames.forEach(g=> {
            let searchString = g.image;
            let div = [...document.querySelectorAll(`tr[data-image="./cache/${searchString}"]`)];
            if (!div.length) {
                console.warn(`Unable to find ${searchString} on any table row`);
                return;
            };

            let firstTD = div[0];
            firstTD.dataset.foundOnDrive = 'true';
            let child = firstTD.children[0];
            child.classList.add('exeFound');
            child.innerHTML = '<i title="Game Is On Disk" class="fa-brands fa-xbox" style="margin-right: 16px;"></i>' + firstTD.children[0].innerHTML;
        });
    },

    repositionImageContainer: ()=> {
        let optionsMenu = document.getElementById('optionsMenu');
        let imageContainer = document.getElementById('imageContainer');
        let rI = document.getElementById('ripperInfo');

        let { y, height } = rI.getBoundingClientRect();
        let bB = optionsMenu.getBoundingClientRect();
        let y2 = bB.y;
        let height2 = bB.height;

        let yStart = y+height;
        let yStart2 = y2+height2;

        optionsMenu.style.backgroundColor = yStart2>yStart ? '#111111FC' : '#111111DD';

        yStart2>yStart && (yStart=yStart2)

        let border = 10;
        let sizeOfImageContainer = window.innerHeight - yStart;

        sizeOfImageContainer-=border*2

        imageContainer.style.top = `${yStart+border}px`;
        imageContainer.style.height = `${sizeOfImageContainer-border}px`;

        
    },

    resizeTable: ()=> {
        let tableContainer = document.getElementById('listAndImageContainer');
        let tableTag = document.getElementById('gameListTable');

        let bB = tableContainer.getBoundingClientRect();
        let width = bB.width - 256 - 2 - 20;
        tableTag.style.width = `${width}px`
    },

    scrollToTop: ()=> {
        window.scrollTo({ top: 200, behavior: 'smooth' });
    },

    searchByFirstLetter: (letter,div)=> {
        vars.unhighlightAllLetters();
        div.classList.add('letterSelected');
        vars.showAllRows();
        if (letter==='') return; // show all

        if (letter==='available') {
            [...document.querySelectorAll(`tr[data-found-on-drive="false"]`)].forEach(d=> {
                d.style.display = 'none';
            });
            vars.updateCountText(vars.availableGames.length);
            return;
        };

        if (letter==='#') {
            let rows = [...document.querySelectorAll('.title')];
            let rowsToHide = rows.filter(tr=>!(/^[0-9]/).test(tr.dataset.title[0]));
            rowsToHide.forEach(r=>r.style.display='none');
            vars.updateCountText(rows.length - rowsToHide.length);
            return;
        };

        let rows = [...document.querySelectorAll('.title')];
        let rowsToHide = rows.filter(tr=>tr.dataset.title[0]!==letter.toLowerCase());

        rowsToHide.forEach(r=>r.style.display='none');

        vars.updateCountText(rows.length - rowsToHide.length);
    },

    searchByStatus: (status)=> {
        vars.unhighlightAllLetters();
        vars.showAllRows();

        let rows = [...document.querySelectorAll('.title')];
        let rowsToHide = rows.filter(tr=>tr.dataset.status!==status.toLowerCase());

        rowsToHide.forEach(r=>r.style.display='none');

        vars.updateCountText(rows.length - rowsToHide.length);
    },

    searchByText: (text)=> {
        vars.unhighlightAllLetters();
        vars.showAllRows();
        
        if (text.trim()==='') return; // show all
        
        let searchString = vars.simplifyTitle(text);
        let rows = [...document.querySelectorAll('.title')];
        let rowsToHide = rows.filter(tr=>!tr.dataset.title.includes(searchString))
        
        rowsToHide.forEach(r=>r.style.display='none');

        vars.updateCountText(rows.length - rowsToHide.length);
    },
    
    showAllRows: ()=> {
        vars.scrollToTop();

        let allRows = [...document.querySelectorAll('.title')];
        allRows.forEach(r=>r.style.display='')
    },

    showImage: (src)=> {
        let container = document.getElementById('imageContainer');
        container.style.backgroundImage = `url(${src})`;
    },

    showManualContainer: (show=true, title='')=> {
        let manualContainer = document.getElementById('manualContainer');
        let closeButton = document.getElementById('closeIFrame');
        if (!show) {
            closeButton.classList.remove('active');
            document.body.style.overflowY = 'auto';
            manualContainer.classList.remove('active');
            manualContainer.src = '';
            return;
        };

        let available = vars.availableGames;

        let titleData = available.find(g=>g.title===title);
        let titleOfGame = titleData.title;
        let manual = titleData.manual;
        if (!manual) return;

        closeButton.classList.add('active');
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        let manualLink = `./availableGames/${titleOfGame}/${manual}`;
        manualContainer.src = manualLink;


        manualContainer.classList.add('active');
        document.body.style.overflowY = 'hidden';
    },

    simplifyTitle(title) {
        return title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    },

    unhighlightAllLetters: ()=> {
        let div = document.querySelector('.letterSelected')
        if (!div) return;
        div.classList.remove('letterSelected');
    },

    updateButtonWithPercentages: ()=> {
        let percentages = vars.counts.percentages;
        [...document.querySelectorAll('.legendText')].forEach(b=> {
            let type = b.id.replace('status','').toLowerCase();
            let percent = percentages[type];
            b.innerHTML += ` (${percent}%)`;
        });
    },

    updateCountText: (count)=> {
        document.getElementById('totalCount').innerHTML = `<td colspan="2">${count} results found</td>`;
    }
};

vars.init();