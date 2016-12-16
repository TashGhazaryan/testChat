jQuery(function ($) {
    var socket = io.connect();
    var $nickForm = $('#setNickname');
    var $nickError = $('#nickError');
    var $nickBox = $('#nickname');
    var $messageForm = $('#send-message');
    var $messageBox = $('#message');
    var $chat = $('#chat');
    var $users = $('#users');
    var $file = $('#file');


    $file.submit( function (e) {
        var data = new FormData($(this)[0]);

        console.log($(this))
        console.log(data);
        jQuery.ajax({
            url: '/img',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function(data){
                $chat.append('<img style="height: 150px; weight" src="'+data+'"><br>');
            }
        });
        return false;

    });

    $nickForm.submit(function (e) {
        e.preventDefault();
        socket.emit('new user',$nickBox.val(), function (data) {
            if (data) {
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('That username is already taken')
            }
        });
        $nickBox.val('');
    });

    socket.on('usernames', function (data) {
        var html = '';
        for( var i = 0; i < data.length; ++i) {
            html += data[i] + '<br>';
        }
        $users.html(html);

    });

    $messageForm.submit(function (e) {
        e.preventDefault();
        socket.emit('send message',$messageBox.val(), function (data) {
            $chat.append('<span class="error"><b>'+ data + "</span><br>");
        });
        $messageBox.val('');
    });

    socket.on('new message', function (data) {
        $chat.append('<span class="msg"><b>'+data.nick + ':</b>' + data.msg + "</span><br>");
    });
    socket.on('whisper', function (data) {
        $chat.append('<span class="whisper"><b>'+data.nick + ':</b>' + data.msg + "</span><br>");
    });


    //var ctx = document.getElementById('canvas').getContext('2d');
    socket.on("image", function(info) {
        console.log('achieved');
        if (info.image) {
            console.log('achieved');
            var img = new Image();
            img.src = 'data:image/jpeg;base64,' + info.buffer;
            ctx.drawImage(img, 0, 0);
        } else {
            console.log('do not achieved')
        }
    });
})