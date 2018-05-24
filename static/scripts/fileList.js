'use strict';$(function(){var a=$('#offlineDownloadLink'),b=$('#offlineDownloadIsPublicCheckbox'),c=$('#offlineDownloadModalBtn'),d=$('#offlineDownloadModal');c.click(function(f){f.preventDefault();var g=a.val(),h=b.prop('checked');REGEXP.URL.test(g)?AJAX('/offlineDownload/downloadLink',{link:g,isPublic:h},function(j){var k=j.status,l=j.msg,m=j.data;showAlert(l,k),k&&(a.val(''),hideModal(d))},function(j){showAlert(MSG.ERROR),console.log(j)}):(setElementClass(a,'is-invalid'),showAlert('\u8F93\u5165\u94FE\u63A5\u65E0\u6548'))})});function refreshFileList(){var a=function(b,c,d,f){return $('<tr class="fileListRow">\n                    <td><input type="radio" data-fileID="'+b+'"></td>\n                    <td class="fileName">'+c+'</td>\n                    <td>'+(d/1024/1024).toFixed(2)+' M</td>\n                    <td>'+parseTimeString(f)+'</td>\n                </tr>')};AJAX('/user/getFileList',{},function(b){var c=b.status,d=b.msg,f=b.data;if(!c)showAlert(d);else{var g=f.fileList;if(!Object.is(g,null)){var h=$('#fileListBody');h.html('');var _iteratorNormalCompletion=!0,_didIteratorError=!1,_iteratorError=void 0;try{for(var k,l,j=g[Symbol.iterator]();!(_iteratorNormalCompletion=(k=j.next()).done);_iteratorNormalCompletion=!0)l=k.value,h.append(a(l.id,l.fileName,l.fileSize,l.createdAt))}catch(m){_didIteratorError=!0,_iteratorError=m}finally{try{!_iteratorNormalCompletion&&j.return&&j.return()}finally{if(_didIteratorError)throw _iteratorError}}refreshRatios()}}},function(b){showAlert(MSG.ERROR),console.log(b)})}$(function(){refreshFileList()}),$(function(){var a=$('#refreshFileListBtn');a.click(function(b){b.preventDefault(),refreshFileList()})});function refreshRatios(){var a=$('.fileListRow');a.click(function(b){a.find('input[type=radio]').prop('checked',!1),$(b.target).parent().find('input[type=radio]').prop('checked',!0)})}$(function(){refreshRatios()}),$(function(){var a=$('#uploadControl'),b=$('#uploadProgressBar'),c=$('#uploadIsPublicCheckbox'),d=$('#uploadModalBtn');d.click(function(f){f.preventDefault();for(var g=new FormData,h=0;h<a[0].files.length;h++)g.append('file',a[0].files[h]);g.append('isPublic',c.prop('checked')),$.ajax({xhrFields:{withCredentials:!0},url:'https://'+DOMAIN+'/server/upload',method:'post',data:g,processData:!1,contentType:!1,async:!0,success:function success(j){var k=j.status,l=j.msg;showAlert(l,k),refreshFileList()},error:function error(j){showAlert(MSG.ERROR),console.log(j)},xhr:function xhr(){var j=$.ajaxSettings.xhr();return j.upload&&j.upload.addEventListener('progress',function(k){if(k.lengthComputable){var l=100*(k.loaded/k.total);b.css('width',l+'%'),a.change(function(){b.css('width','0%')})}},!1),j}})})}),$(function(){var a=$('.modal');a.on('hidden.bs.modal',function(b){Object.is($(b.target).find('form')[0],void 0)||$(b.target).find('form')[0].reset()})}),$(function(){var a=$('#downloadBtn');a.click(function(b){b.preventDefault();var c=$('input[type=radio]:checked');if(0===c.length)showAlert('\u8BF7\u9009\u62E9\u8981\u4E0B\u8F7D\u7684\u6587\u4EF6');else if(1<c.length)showAlert('\u4F60\u600E\u4E48\u9009\u4E2D\u591A\u4E2A\u6587\u4EF6\u7684\uFF0C\u4F5C\u5F0A\u4E86\u5427');else{var d=c.attr('data-fileid');AJAX('server/download/getDownloadLink',{fileId:d},function(f){var g=f.status,h=f.msg,j=f.data;showAlert(h,g),download(j.downloadLink)},function(f){showAlert(MSG.ERROR),console.log(f)})}})}),$(function(){var a=$('#deleteBtn'),b=$('#deleteModal'),c=$('#deleteModalBtn'),d=$('#deleteFileName'),f=null;a.click(function(g){if(g.preventDefault(),f=$('input[type=radio]:checked'),0===f.length)showAlert('\u8BF7\u9009\u62E9\u8981\u5220\u9664\u7684\u6587\u4EF6');else if(1<f.length)showAlert('\u4F60\u600E\u4E48\u9009\u4E2D\u591A\u4E2A\u6587\u4EF6\u7684\uFF0C\u4F5C\u5F0A\u4E86\u5427');else{var h=f.parent().siblings('.fileName');d.text(h.text()),b.modal('show')}}),c.click(function(g){g.preventDefault();var h=f.attr('data-fileid');AJAX('/delete',{fileId:h},function(j){var k=j.status,l=j.msg,m=j.data;showAlert(l,k),b.modal('hide'),refreshFileList()},function(j){showAlert(MSG.ERROR),console.log(j)})})});