/**
 * MagicPureGrayOutput
 * @author ZXLee
 * @github https://github.com/SmileZXLee/MagicPureGrayOutput
 */

var vm = new Vue({
	el: '.main',
	data: {
		progressValue: '0%',
		currentProgress: 0,
		showCopyright: true,
		showContainer: false,
		modeClass: 'mode-change-empty',
		modeText: '黑',
		mainBacColor: 'white',
		currentInputImage: null,
		saveBtnText: '点击下载/右键图片保存',
		currentBlackImage: null,
		currentWhiteImage: null,
		downCanvas: null
	},	
	mounted () {
	  var isMobile = this.isMobile();
	  if(isMobile){
		  this.saveBtnText = '点击下载/长按图片保存';
	  }
	},
	watch:{
		showCopyright(val){
			this.showContainer = !this.showCopyright;
		}
	},
	methods:{
		inputChange(e){
			this.progressValue = '0%';
			this.showCopyright = false;
			var $this = this;
			var timer = setInterval(function(){
				$this.progressValue = $this.currentProgress + '%';
				if($this.currentProgress > 99){
					clearInterval(timer);
					setTimeout(function(){
						$this.progressValue = '0%';
					},500)
				}
			},1)
			var inputImage = e.target.files[0];
			if(!inputImage)return;
			this.handleOutput(inputImage);
		},
		handleOutput(inputImage){
			this.currentInputImage = inputImage;
			var $this = this;
			var canvas = document.getElementById('main-canvas');
			var context = canvas.getContext('2d'); 
			this.$refs.uploadData.value = null;
			var reader = new FileReader(); 
			reader.readAsDataURL(inputImage); 
			reader.onload = function(e){ 
				var image = new Image(); 
				image.src = e.target.result; 
				image.onload = function(){
				var img_width = this.width; 
				var img_height = this.height; 
				canvas.width = img_width; 
				canvas.height = img_height; 
				context.drawImage(this, 0, 0, img_width, img_height);
				$this.showInImgContainer(canvas);
				setTimeout(function(){
					var imageData = context.getImageData(0, 0, img_width, img_height);
					for(var i = 0; i < imageData.data.length; i += 4) { 
						var gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
						if($this.modeClass != 'mode-change-empty'){
							imageData.data[i] = 255;
							imageData.data[i+1] = 255;
							imageData.data[i+2] = 255;
							imageData.data[i+3] = imageData.data[i+3] == 0 ? 0 : gray;
						}else{
							imageData.data[i] = 0;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;
							imageData.data[i+3] = imageData.data[i+3] == 0 ? 0 : 255 - gray;
						}
						
						$this.currentProgress = (i / (imageData.data.length * 1.0) * 100);
					}
					context.putImageData(imageData,0,0);
					$this.showInImgContainer(canvas);
					var currentImage = new Image();
					currentImage.src = canvas.toDataURL("image/png");
					if($this.modeClass == 'mode-change-empty'){
						$this.currentBlackImage = currentImage;
					}else{
						$this.currentWhiteImage =currentImage;
					}
					$this.downCanvas = canvas;
				},10)
				
				}
			}
		},
		saveClick(){
			if(this.showCopyright){
				alert('请先选取需要处理的图片');
				return;
			}
			// if(this.isMobile()){
			// 	alert('长按上方图片保存至相册');
			// 	return;
			// }
			var canvas = this.downCanvas;
			var imgURL = canvas.toDataURL("image/png");
			var downloadLink = document.createElement('a');
			downloadLink.download = 'MagicPureGrayOutput-' + (new Date()).getTime();
			downloadLink.href = imgURL;
			downloadLink.dataset.downloadurl = ["image/png", downloadLink.download, downloadLink.href].join(':');
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		},
		showInImgContainer(canvas){
			var showContainer = document.getElementById("show-container-id");
			var imgURL = canvas.toDataURL("image/png");
			showContainer.src = imgURL;
		},
		toGithub(){
			window.open('https://github.com/SmileZXLee/MagicPureGrayOutput');
		},
		changeModeClick(){
			this.modeClass = this.modeClass == 'mode-change-empty' ? 'mode-change-full' : 'mode-change-empty';
			this.modeText = this.modeText == '黑' ? '白' : '黑';
			this.mainBacColor = this.mainBacColor == 'white' ? 'black' : 'white';
			if(this.currentInputImage){
				this.handleOutput(this.currentInputImage);
			}
		},
		composeClick(){
			if(!this.currentBlackImage){
				alert('您未选择转换为纯黑色像素的图片');
				return;
			}
			if(!this.currentWhiteImage){
				alert('您未选择转换为纯白色像素的图片');
				return;
			}
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d'); 
			canvas.width = this.currentBlackImage.width;
			canvas.height = this.currentBlackImage.height;
			context.drawImage(this.currentBlackImage, 0, 0, this.currentBlackImage.width, this.currentBlackImage.height);
			context.globalAlpha = 0.2;
			context.drawImage(this.currentWhiteImage, 0, 0, this.currentBlackImage.width, this.currentBlackImage.height);
			this.showInImgContainer(canvas);
			this.downCanvas = canvas;
			this.mainBacColor = 'yellowgreen';
		},
		isMobile(){
			return navigator.userAgent.match(/Android/i)
				|| navigator.userAgent.match(/webOS/i)
				|| navigator.userAgent.match(/iPhone/i)
				|| navigator.userAgent.match(/iPad/i)
				|| navigator.userAgent.match(/iPod/i)
				|| navigator.userAgent.match(/BlackBerry/i)
				|| navigator.userAgent.match(/Windows Phone/i);
		}
	}		
});
