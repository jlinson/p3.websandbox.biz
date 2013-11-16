<?php
/* @var $this SiteController */

$this->pageTitle=Yii::app()->name;
$headerName = substr(Yii::app()->name, 0, strpos(Yii::app()->name, "("))
?>

<h1>Welcome to <i><?php echo CHtml::encode($headerName); ?></i></h1>

<p></p>

<form method="post" action="index.php">
    <table id="grid" class="squares">
        <?php for ($i=0; $i < 3; $i++): ?>
            <tr>
                <?php for ($j=0; $j < 3; $j++): ?>
                    <td>
                        <table class="block" id="b<?php echo (($i*3) + $j); ?>">
                            <?php for ($k=0; $k < 3; $k++): ?>
                                <tr>
                                    <?php for ($l=0; $l < 3; $l++): ?>
                                        <td class="cell" id="c<?php echo (string) (($i*3)+$j) . (($k*3)+$l); ?>">
                                            <input type="text" class="cell" name="c<?php echo (string) (($i*3)+$j) . (($k*3)+$l); ?>">
                                        </td>
                                    <?php endfor; ?>
                                </tr>
                            <?php endfor; ?>
                        </table>
                    </td>
                <?php endfor; ?>
            </tr>
        <?php endfor; ?>
    </table>
</form>
<br>
<hr>
<br>
<table id="tracker" class="squares">
    <tr>
        <?php for ($t=0; $t < 9; $t++): ?>
            <td class="cell" id="t<?php echo ($t + 1); ?>"><?php echo ($t + 1); ?></td>
        <?php endfor; ?>
    </tr>
</table>

<p>For more details on how to further develop this application, please read
the <a href="http://www.yiiframework.com/doc/">documentation</a>.
Feel free to ask in the <a href="http://www.yiiframework.com/forum/">forum</a>,
should you have any questions.</p>
