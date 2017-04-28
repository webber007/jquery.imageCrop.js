<?php
		 
		$width = 300;
		$height = 300;
		
		//$tag = isset($_POST['bg'])?$_POST['bg']:'1';打哪张水印
		$src = trim($_POST['hidsrc']);
		  
		$src = dirname(__file__).'/'.$src;
		
		//$bg = APP_ROOT.'/views/styles/images/model'.$tag.'.png'; //用户选择的背景

		$w = $_POST['sw'];
		$h = $_POST['sh'];
		$x = $_POST['sx'];
		$y = $_POST['sy'];
		$x = ($x<0)?0:$x;
		$y = ($y<0)?0:$y;
		
		//开始裁剪图片
		$data = GetImageSize($src);
		switch ($data[2])
		{
			case 1:
				$im = imagecreatefromgif($src);break;
			case 2:
				$im = imagecreatefromjpeg($src);break;
			case 3:
				$im = imagecreatefrompng($src);break;
			default:
				return 0;
		}
		
		$newim = imagecreatetruecolor($width,$height);//画布
		$bgcolor = imagecolorallocate($newim,255,255,255);//创建白色背景
		imagefilledrectangle($newim,0,0,$width,$height,$bgcolor); //画个大小一致矩形充当背景
		imagecopyresampled($newim,$im,0,0,$x,$y,$width,$height,$w,$h);
		 
		$src = 'out'.time().'.jpg';
		imagejpeg($newim,$src,100);
		imagedestroy($im);
		imagedestroy($newim);
		echo str_replace(dirname(__file__).'/','',$src);
?>
