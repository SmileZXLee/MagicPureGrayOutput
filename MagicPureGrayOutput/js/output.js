var vm = new Vue({
	el: '.main',
	data: {
		progressValue: '0%',
		showCopyright: true,
		modeClass: 'mode-change-empty',
		modeText: '黑',
		mainBacColor: 'white',
		currentInputImage: null
	},	
	methods:{
		inputChange(e){
			this.progressValue = '0%';
			this.showCopyright = false;
			var $this = this;
			var currentProgress = 0;
			var timer = setInterval(function(){
				$this.progressValue = currentProgress + '%';
				if(currentProgress > 99){
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
							imageData.data[i+3] = gray;
						}else{
							imageData.data[i] = 0;
							imageData.data[i+1] = 0;
							imageData.data[i+2] = 0;
							imageData.data[i+3] = 255 - gray;
						}
						
						currentProgress = (i / (imageData.data.length * 1.0) * 100);
					}
					context.putImageData(imageData,0,0);
					$this.showInImgContainer(canvas);
				},10)
				
				}
			}
		},
		saveClick(){
			if(this.showCopyright){
				alert('请先选取需要处理的图片');
				return;
			}
			var canvas = document.getElementById("main-canvas");
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
		changeMode(){
			this.modeClass = this.modeClass == 'mode-change-empty' ? 'mode-change-full' : 'mode-change-empty';
			this.modeText = this.modeText == '黑' ? '白' : '黑';
			this.mainBacColor = this.mainBacColor == 'white' ? 'black' : 'white';
			if(this.currentInputImage){
				this.handleOutput(this.currentInputImage);
			}
		}
	}		
});
