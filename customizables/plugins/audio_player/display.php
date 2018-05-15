<?php
global $config, $settings;
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<title></title>
	<link rel="stylesheet" href="css/style.css?v=<?php echo $settings->currentVersion;?>" />
	<link rel="stylesheet" href="css/ext.php?v=<?php echo \S::forURL($settings->currentVersion);?>&theme=<?php echo \S::forURL($settings->ui_theme);?><?php if ($config['misc']['developmentMode']) {echo '&debug=1';}?>" />
	<link rel="stylesheet" href="<?php echo $this->url;?>/style.css?v=<?php echo $settings->currentVersion;?>" />
</head>
<body id="theBODY">
<div id="loadMsg"><div><?php echo \FileRun\Lang::t("Loading audio player...", $this->localeSection)?></div></div>
<script src="js/min.php?extjs=1&v=<?php echo $settings->currentVersion;?><?php if ($config['misc']['developmentMode']) {echo '&debug=1';}?>"></script>
<script src="<?php echo $this->url;?>/js/app.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="?module=fileman&section=utils&page=translation.js&sec=<?php echo \S::forURL("Custom Actions: Audio Player")?>&lang=<?php echo \S::forURL(\FileRun\Lang::getCurrent())?>"></script>
<script src="<?php echo $this->url;?>/js/howler.min.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/aurora.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/alac.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/flac.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/aac.js?v=<?php echo $settings->currentVersion;?>"></script>
<script>
	var URLRoot = '<?php echo \S::safeJS($config['url']['root'])?>';
</script>
</body>
</html>