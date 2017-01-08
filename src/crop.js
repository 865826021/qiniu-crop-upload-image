/**
 * Created by YIHONG on 8/28/16.
 */

import Cropper from 'cropperjs';
import './less/cropperjs.less';
import './less/cropperjs-custom.less';
import './less/style.less';
import ajax from 'client-ajax';

var cropper = null;
var defaults = {
    debug: false,
    measure: 1,
};
var popContent = `
    <div class="content">
        <input id="file-input" type="file" accept="image/png,image/jpg"
               style="display: none">
        <div class="">
            <img id="image" />
        </div>
        
    </div>
    <div class="ctrl-bar" style="margin-top: 10px;">
            <a href="javascript:;" id="cancel">取消</a>
            <a href="javascript:;" id="confirm">确定</a>
    </div>
`;

var getQiniuToken = function (cb) {
    ajax({
        url: defaults.qiniu_token_url,
        method: 'GET',
        format: 'json'
    }, function (err, body) {
        if (err)
            return console.log(err)
        if (body && body.uptoken) {
            if (defaults.debug)
                console.info(`token:${body.uptoken}`);

            cb(body.uptoken);
        }
        else {
            return console.error('token return format error,please confirm your qiniu_token_url');
        }

    })
};
var pushImageToQiniu = function (imageData, cb) {

    var promise = new Promise((resolve, reject) => {
        getQiniuToken((token) => {
            resolve(token);
        });

    });
    promise.then((token) => {
        var url = "http://up-z2.qiniu.com/putb64/-1";
        var xhr = new XMLHttpRequest();
        var xhrget = new XMLHttpRequest();
        var obj;
        //xhr.onreadystatechange=function(){
        //	if (xhrget.readyState==4){
        //		 obj = JSON.parse(xhrget.responseText);
        //	}
        //}
        //xhrget.open("GET", "http://jssdk.demo.qiniu.io/uptoken", true);
        // xhrget.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // document.getElementById("myDiv").innerHTML = xhr.responseText;
                cb((JSON.parse(xhr.responseText).key));
            }
        }

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.setRequestHeader("Authorization", "UpToken " + token);
        xhr.send(imageData);
        // ajax({
        //         url: 'http://up-z2.qiniu.com/putb64/-1',
        //         method: 'POST',
        //         data: imageData,
        //         headers: {
        //             'Content-Type': 'application/octet-stream',
        //             'Authorization': 'UpToken ' + token
        //         },
        //     },
        //     function (err, body) {
        //         if (err) return console.log(err);
        //
        //         cb(body.key);
        //     }
        // )
    });


};


var crop = {
    /**
     *
     * @param option {measure:1}
     * @param cb
     */
    init(option, cb)
    {

        //replace defaults
        for (let o in option) {
            defaults[o] = option[o];
        }

        if (cropper == null) {
            var $div = document.createElement('div');
            $div.className = 'crop-mask';
            $div.innerHTML = popContent;
            document.getElementsByTagName('body')[0].appendChild($div);
            let image = document.getElementById('image');
            cropper = new Cropper(image, {
                aspectRatio: defaults['measure'],
                viewMode: 0,
                dragMode: 'move',
                center: true,
                crop: function (e) {

                }
            });
            var input = document.getElementById('file-input');
            var URL = window.URL || window.webkitURL;

            input.addEventListener('change', function () {
                let file = this.files[0];
                if (!/image\/\w+/.test(file.type)) {
                    //unexpected file
                    return false;
                }
                let blobURL = URL.createObjectURL(file);
                cropper.reset().replace(blobURL);
                input.value = '';
                document.getElementsByClassName('crop-mask')[0].style.display = 'block'

            }, false);


            document.getElementById('confirm').onclick = () => {
                var imageDataUrl = cropper.getCroppedCanvas().toDataURL('image/jpeg');
                pushImageToQiniu(imageDataUrl.split(',')[1], (imgSrc) => {
                    if (!defaults.qiniu_res_root)
                        return console.error('qiniu_res_root is null');
                    let imgUrl = defaults['qiniu_res_root'] + imgSrc
                    cb(imgUrl);
                    if (defaults.debug)
                        console.info(`imageUrl:${imgUrl}`);
                    document.getElementsByClassName('crop-mask')[0].style.display = 'none'

                });

            };
            document.getElementById('cancel').onclick = () => {
                document.getElementsByClassName('crop-mask')[0].style.display = 'none'
            };

        }


    },
    start(){
        var input = document.getElementById('file-input');
        input.click();


    }
};
export default crop;