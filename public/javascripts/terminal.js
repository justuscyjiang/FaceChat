function terminal() {
    var res = []
    switch (msg) {


        case 'version':

            res.push(msg, 'Version 2019.06.11 success')
            appendTerminal(res)
            break
        case 'end':
            config = false
            socket.on('message', (obj) => {
                appendData([obj]);
            });

            socket.on('messageP', (obj) => {
                appendDataP([obj]);
            });
            if (!privateMessages) {
                socket.emit('history');
            } else {
                socket.emit('historyP')
            }
            break
        case 'help':
        default:
            break
    }
}

function appendTerminal(res) {
    let el = document.querySelector('.speeches');
    var textnode = document.createTextNode('> ' + res[0]);
    el.replaceChild(textnode, el.lastChild);
    let html = el.innerHTML;
    html +=
        `<br>
    <div style="font-size:16px, font-family:Monaco">${res[1]}</div><br>
    <div style="font-size:16px, font-family:Monaco">></div>
    `;
    // html +=
    //     `
    //     <div class="${element.name == account ? 'right circular group' : 'circular group'}">
    //         <div class="speech">
    //             ${element.name == account? "<div class='group'>":''}
    //                 <div class="avatar">
    //                     <img src="${element.name == account ? './images/user.png' : './images/user1.png'}">
    //                 </div>
    //                 <div class="content">
    //                     <div class="inline author">${element.name == account ? '' : element.name}</div>
    //                     <div class="text">${element.name == account ? element.msg : '：' + element.msg}</div> 
    //                 </div>  
    //                 <div class=" time">${moment(element.time).fromNow()}</div>
    //             ${element.name == account? "</div>":''}
    //         </div>
    //     </div>
    //     `;


    el.innerHTML = html.trim();
    scrollWindow();

}