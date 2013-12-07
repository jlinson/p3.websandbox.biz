<?php
/* @var $this SiteController */

$cs=Yii::app()->clientScript;
$baseUrl = Yii::app()->baseUrl;
$cs->registerScriptFile($baseUrl.'/js/grid.js', CClientScript::POS_END);
$cs->registerCssFile($baseUrl.'/css/grid.css');

$this->pageTitle=Yii::app()->name;
$headerName = substr(Yii::app()->name, 0, strpos(Yii::app()->name, "("))
?>

<h1>Welcome to <i><?php echo CHtml::encode($headerName); ?></i></h1>

<p></p>
<div id="game">
    <form name="game" method="post" action="index.php">
        <div id="grid" class="block-wrapper">
            <?php for ($i=0; $i < 3; $i++): ?>
                <?php for ($j=0; $j < 3; $j++): ?>
                    <div class="block" id="b<?php echo (($i*3) + $j); ?>">
                        <?php for ($k=0; $k < 3; $k++): ?>
                            <?php for ($l=0; $l < 3; $l++): ?>
                                <div class="cell input" id="c<?php echo (string) (($i*3)+$j) . (($k*3)+$l); ?>">
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
        <button name="undo" type="button">Undo &#8634;</button>
        <!-- <button name="redo" type="button">Redo &#10227;</button> -->
        <button name="note" type="button">Note &#9997;</button>
        <button name="erase" type="button">Erase &#10008;</button>
    </div>
    <div id="tracker" class="block-wrapper">
        <?php for ($t=0; $t < 9; $t++): ?>
            <div class="cell pickem" id="t<?php echo ($t + 1); ?>"><?php echo ($t + 1); ?></div>
        <?php endfor; ?>
    </div>
</div>
<div id="game-btns">
    <div id="timers">
        Elapsed Time:
        <div id="elapsed-time">0:00</div>
        Best Time:
        <div id="best-time">0:00</div>
    </div>
    <hr>
    <button name="load" type="button">New Game</button>
    <button name="reset" type="button">Reset</button>
    <button name="play" type="button">Play</button>
    <select name="level" size="1">
        <option value="0">Beginner</option>
        <option value="1">Easy</option>
        <option value="2">Medium</option>
        <option value="3">Hard</option>
        <option value="4">Expert</option>
    </select>

    <!-- <button name="hint" type="button">Hint</button> -->
    <hr>
    <button name="print" type="button">Print</button>
</div>
<div id="sidebar">
    <div id="instructions">

    </div>
    <div id="Preferences">

        <p>For more details on how to further develop this application, please read
            the <a href="http://www.yiiframework.com/doc/">documentation</a>.
            Feel free to ask in the <a href="http://www.yiiframework.com/forum/">forum</a>,
            should you have any questions.</p>

    </div>
</div>
