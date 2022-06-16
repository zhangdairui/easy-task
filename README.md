![8DcShTdXGwROnMI](https://s2.loli.net/2022/06/16/8DcShTdXGwROnMI.png)


# Easy Task　開発記録

- プログラムURL：
🟣[https://easy-task.fun/](https://easy-task.fun/)🟣


## プログラム紹介

機能もスタイルも非常にシンプルな「Easy Task」というタスク管理アプリです。
面接のテストですが、要求を確認することから完成まで、本当のプロジェクトみたいなあと思って、とてもありがたく、楽しくコーディングさせていただいた一週間でした。

## デザイン

### 基本機能と実現
課題詳細ドキュメントで定義されていますが、主に：

- ログイン・ログアウト：Sessionで作りました

- タスクの表示、編集、追加、削除：クライアントの操作をサーバー（Express）に提出して、Expressはデータベースを操作する。もし取ってきたデータ結果をクライアントに送る場合、Ajaxでjsonデータを送ります。

### 課題の内容以外の追加した機能

- 新規ユーザー登録
- 一覧画面にタスクの全選択機能
- タスクの予定日と完了日を設定・変更する際に、完了日は必ず予定日の後に設定されないといけないカレンダーフォーム制限機能
- 絵文字で優先順位を表現する
	
　　　＊理由：数字や文字よりちょっと変わっていますが、直観的だという利点もあると考えました。また、サイト自体がシンプルなので、少しでもユーモアや面白さを増やしたくて、「タスク」と言えば、仕事と任務に繋がっているイメージがありますので、面白さを増やしたら、気持ちも少し楽になれるではないかと思っています。


### デザイン

- MOCKUP

![1.JPG](https://s2.loli.net/2022/06/16/xmXkutrs1JpSgAY.jpg)
![2.JPG](https://s2.loli.net/2022/06/16/eR6TlOnJHw4tGDy.jpg)

- 配色
![dEU1ou9P6QWZbOz](https://s2.loli.net/2022/06/16/dEU1ou9P6QWZbOz.png)



## 開発とデプロイ

### 開発

- OS：macOS 12.2.1
- フロントエンド：Bootstrap5、Jquery、EJS
- サーバーエンド：Express（Node.js）
- データベース：MySQL
- ほか：オーペンソースEmoji　[OpenMoji](openmoji.org)


### デプロイ

- ウェブサーバー：[Tencent Cloud](https://cloud.tencent.com/)
- サーバー管理UI：[宝塔](https://cloud.tencent.com/)


## タスク一覧画面の細かい注意点
### イベントの伝搬停止
- 問題点：タスク一覧画面で、タスクをチェックしたい場合、親要素のtr（テーブルの毎行）はそのクリック動作で更新画面に移動してしまう。

- 解決：チェックボックスのところをクリックしても、イベントの親要素へ伝搬しないようにする

```
<td class="check-column" onclick="stopHref()">
    <input class="square-check-uc" name="taskCheck" type="checkbox" value=<%= item.taskId %>>
</td>

<script>
    var stopHref = function () {
        event.stopPropagation();
    }
</script>
```

### タブのスイッチとチェックボックスのクリア
- 問題点：完了・未完了のリストはスイッチできるナビタブで作りました。それで、それぞれのタブをスイッチする時に、全てのチェックボックスを未選択の状態にしないといけません。じゃないと、例えば、ユーザーは未完了リストでタスクをチェックして、忘れて完了タスクへ移動して、他のタスクをチェックして削除したら、前未完了リストでチェックしたタスクも一緒に削除されてしまう可能性があります。

- 解決
```
<script>
    //-----------------------clear checked boxes when change tab----------------------------------
    $('#uncompleted-tab').click(function () {
        $(".selectAll-uc").prop("checked", false);
        $('.square-check-uc').each(function () {
            this.checked = false;
        });
        $('.square-check-c').each(function () {
            this.checked = false;
        });
    })
    $('#completed-tab').click(function () {
        $(".selectAll-c").prop("checked", false);
        $('.square-check-uc').each(function () {
            this.checked = false;
        });
        $('.square-check-c').each(function () {
            this.checked = false;
        });
    })
</script>
```
