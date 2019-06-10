var privateMessages = false
var config = false

if (account) {

    // 新增使用者    

    console.log('account:' + account);

    // socket = io.connect('ws://localhost:3001');
    socket = io.connect();

    socket.emit('clients', account);

    // 歷史訊息
    socket.on('history', (obj) => {
        if (obj.length > 0) {
            appendData(obj);
        }
    });

    socket.on('historyP', (obj) => {
        if (obj.length > 0) {
            appendDataP(obj);
        }
    });

    socket.on('clients', (obj) => {
        console.log(obj);
        document.querySelector('.online').innerHTML = obj.clients;
        if (obj.user !== undefined) broadcast(obj.user);
    });

    socket.on('message', (obj) => {
        appendData([obj]);
    });

    socket.on('messageP', (obj) => {
        appendDataP([obj]);
    });

    socket.on('member', () => {
        ShowOnlineMember()
    });

    // 修改線上名單
    socket.on('refresh', (obj) => {
        document.getElementById("OnlineMemberList").innerHTML = '';

        let el = document.getElementById("OnlineMemberList");
        let html = el.innerHTML;

        obj.forEach(element => {

            html +=
                `
                <div class="item">
                    <div class="ts mini image">
                        <img src='./images/user.png'>
                    </div>
                    <div class="content">
                        <div class="header">${element.name}</div>
                        <div class="meta">
                            <div>${element.status}</div>
                        </div>
                    </div>
                </div>
                `;
        });

        el.innerHTML = html.trim();
    });

}

document.querySelector('#btnAddMsg').addEventListener('click', () => {
    sendData();
});
document.querySelector('input').addEventListener('keypress', (e) => {
    if (e.code == 'Enter' || e.code == 'NumpadEnter') {
        sendData();
    }
});

document.querySelector('#btnReqOnMember').addEventListener('click', () => {
    reqOnMember();
});

/**
 * 傳送訊息
 */
function reqOnMember() {
    socket.emit('member')
}

function sendData() {
    let msg = document.querySelector('input').value;
    if (config) {

        switch (msg) {
            case 'version':
                swal('Version', '2019.06.11', 'success')
                document.querySelector('input').value = '';
                break
            case 'end':
                config = false
                document.querySelector('input').value = '';
                if (!privateMessages) { socket.emit('history') } else { socket.emit('historyP') }
                break
        }
        return
    }
    if (msg == '#trb') {
        // pass
        swal({
            title: "Easter egg!",
            icon: "success",
            buttons: [false, false],
        });
        config = true
        document.querySelector('.speeches').innerHTML = ''
        document.querySelector('input').value = '';
        return
    }
    if (!msg) {
        swal({
            title: "請輸入訊息!",
            icon: "error",
        });
        return;
    }

    if (!privateMessages) {
        let data = {
            name: account,
            msg: msg,
        };
        socket.emit('message', data);
    } else {
        let data = {
            name: account,
            msg: msg,
            to: theOther,
        };
        socket.emit('messageP', data);
    }
    document.querySelector('input').value = '';
}

/**
 * 卷軸捲動至下
 */
function scrollWindow() {
    let h = document.querySelector('.speeches');
    h.scrollTo(0, h.scrollHeight);
}

/**
 * 聊天紀錄
 * @param {聊天訊息} obj 
 */
function appendData(obj) {

    let el = document.querySelector('.speeches');
    let html = el.innerHTML;

    obj.forEach(element => {

        html +=
            `
            <div class="${element.name == account ? 'right circular group' : 'circular group'}">
                <div class="speech">
                    ${element.name == account? "<div class='group'>":''}
                        <div class="avatar">
                            <img src="${element.name == account ? './images/user.png' : './images/user1.png'}">
                        </div>
                        <div class="content">
                            <div class="inline author">${element.name == account ? '' : element.name}</div>
                            <div class="text">${element.name == account ? element.msg : '：' + element.msg}</div> 
                        </div>  
                        <div class=" time">${moment(element.time).fromNow()}</div>
                    ${element.name == account? "</div>":''}
                </div>
            </div>
            `;
    });

    el.innerHTML = html.trim();
    scrollWindow();

}

/**
 * 私人聊天紀錄
 * @param {聊天訊息} obj 
 */
function appendDataP(obj) {

    let el = document.querySelector('.speeches');
    let html = el.innerHTML;

    obj.forEach(element => {
        if ((element.name == account && element.to == theOther) || (element.name == theOther && element.to == account)) {
            html +=
                `
            <div class="${element.name == account ? 'right circular group' : 'circular group'}">
                <div class="speech">
                    ${element.name == account? "<div class='group'>":''}
                        <div class="avatar">
                            <img src="${element.name == account ? './images/user.png' : './images/user1.png'}">
                        </div>
                        <div class="content">
                            <div class="inline author">${element.name == account ? '' : element.name}</div>
                            <div class="text">${element.name == account ? element.msg : '：' + element.msg}</div> 
                        </div>  
                        <div class=" time">${moment(element.time).fromNow()}</div>
                    ${element.name == account? "</div>":''}
                </div>
            </div>
            `;
        }
    });

    el.innerHTML = html.trim();
    scrollWindow();

}

/**
 * 廣播有人進來
 * @param {暱稱} obj 
 */
function broadcast(obj) {

    // <div class="speech">
    //     <div class="broadcast">
    //         <i class="announcement icon"></i>Robby 溜了進來。
    //     </div>
    // </div>

    let el = document.querySelector('.speeches');
    let html = el.innerHTML;

    html +=
        `
        <div class="speech">
            <div class="broadcast">
                <i class="announcement icon"></i>${obj} 溜了進來。
            </div>
        </div>
        `;

    el.innerHTML = html.trim();
    scrollWindow();

}

var ccc = false

function ShowOnlineMember() {
    /*
    <div class="item">
    <div class="ts mini image">
      <img src="./images/pikachu.png">
    </div>
    <div class="content">
      <div class="header">皮卡丘</div>
      <div class="meta">
        <div>@pikachu520</div>
      </div>
    </div>
  </div>
  */

    // show sidebar
    ts('.left.sidebar:not(.inverted)').sidebar({
        scrollLock: true,
        closable: false
    }).sidebar('toggle');
}