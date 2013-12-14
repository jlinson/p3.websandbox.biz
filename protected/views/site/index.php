<?php
/* @var $this SiteController */

$cs=Yii::app()->clientScript;
$baseUrl = Yii::app()->baseUrl;
$cs->registerCoreScript('jquery.ui');
$cs->registerScriptFile($baseUrl . '/js/grid.js', CClientScript::POS_END);
$cs->registerScriptFile($baseUrl . '/js/game.js', CClientScript::POS_END);
$cs->registerScriptFile($baseUrl . '/js/preferences.js', CClientScript::POS_END);
$cs->registerScript('juiAccordian','$("#sidebar").accordion();', CClientScript::POS_READY);
$cs->registerCssFile($cs->getCoreScriptUrl() . '/jui/css/base/jquery-ui.css');
$cs->registerCssFile($baseUrl . '/css/grid.css');

$this->pageTitle=Yii::app()->name;
$headerName = substr(Yii::app()->name, 0, strpos(Yii::app()->name, "("))
?>

<h1>Welcome to <i><?php echo CHtml::encode($headerName); ?></i></h1>

<h5 id="game-caption"></h5>
<div id="game">
    <form name="game" method="post" action="index.php">
        <div id="grid" class="block-wrapper">
            <?php for ($i=0; $i < 3; $i++): ?>
                <?php for ($j=0; $j < 3; $j++): ?>
                    <div class="block" id="b<?php echo (($i*3) + $j); ?>">
                        <?php for ($k=0; $k < 3; $k++): ?>
                            <?php for ($l=0; $l < 3; $l++): ?>
                                <div class="cell input row<?php echo (string) (($i*3)+($k+1)); ?> col<?php echo (string) (($j*3)+($l+1)); ?>" id="c<?php echo (string) (($i*3)+$j) . (($k*3)+$l); ?>">
                                    <input type="text" maxlength="1" class="input-cell" name="c<?php echo (string) (($i*3)+$j) . (($k*3)+$l); ?>">
                                </div>
                            <?php endfor; ?>
                        <?php endfor; ?>
                    </div>
                <?php endfor; ?>
            <?php endfor; ?>
        </div>
    </form>
    <div id="grid-btns">
        <button name="undo" type="button" disabled>Undo &#8634;</button>
        <button name="erase" type="button" disabled>Erase &#10008;</button>
    </div>
    <div id="tracker" class="block-wrapper">
        <?php for ($t=0; $t < 9; $t++): ?>
            <div class="cell pickem" id="t<?php echo ($t + 1); ?>"><?php echo ($t + 1); ?></div>
        <?php endfor; ?>
    </div>
</div>
<div id="game-btns">
    <hr>
    <strong>Game Level:</strong>
    <select name="level" size="1">
        <option value="1">Beginner</option>
        <option value="2">Easy</option>
        <option value="3">Medium</option>
        <option value="4">Hard</option>
        <option value="5">Expert</option>
    </select>
    <button name="load" type="button">New Game</button>
    <button name="reset" type="button">Reset</button>
    <hr>
    <!-- <button name="save" type="button">Save</button> -->
    <!--   hidden   -->
    <button name="grid-save" id="grid-save" type="button" disabled>Save Grid</button>
    <!-- end of hidden -->
</div>
<div id="sidebar">
    <h3>Instructions</h3>
    <div>
        <h5>Game Rules:</h5>
        <p>Solve the Su Doku puzzle by entering a number from 1 to 9 in the empty cells. Each number can only
        appear once in a row, once in a column and once in each 3x3 grid.</p>
        <h5>Sudo Sudoku Instructions:</h5>
        <p>To start a game, click 'New Game'. You can select the game difficulty from the 'Game Level'
        drop-down. On large screens, both keyboard and mouse/touch entry work. Click on a cell, then type a
        number, or select a number from the number bar below the grid. You can turn off keyboard input in the
        <strong>Preferences</strong> section.</p>
    </div>
    <h3>Preferences</h3>
    <div>
        <form name="preferences" method="post" action="index.php">
            <input type="checkbox" name="keyboard" value="enabled" checked>Keyboard Entry<br>
        </form>
        <br>
        <button name="pref-apply" type="button" disabled>Apply</button>
    </div>
    <h3>Additional Information</h3>
    <div>
        <p>See the <strong>Preferences</strong> section for additional game settings.</p>
        <p>Click the <strong>About</strong> option in the top menu to learn more about this program.</p>
        <p>If you have any questions, comments, or encounter any problems, please feel free to fill out a
           <strong>Contact</strong> form.</p>
         <p>Thank you.</p>
    </div>
    <h3>Yii Framework Info</h3>
    <div>
        <p>For more details regarding the framework used to develop this application, please read
        the <a href="http://www.yiiframework.com/doc/">documentation</a>.
        Feel free to ask in the <a href="http://www.yiiframework.com/forum/">forum</a>,
        should you have any questions.</p>
    </div>
</div>
