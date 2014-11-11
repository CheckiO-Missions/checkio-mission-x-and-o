//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210', 'snap.svg_030'],
    function (ext, $, Raphael, Snap) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide = {};
            cur_slide["in"] = data[0];
            this_e.addAnimationSlide(cur_slide);
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            //YOUR FUNCTION NAME
            var fname = 'x_and_o';

            var checkioInput = data.in || [
                ["...", "...", "..."],
                "X"
            ];
            var checkioInputStr = fname + '(' + JSON.stringify(checkioInput[0]).replace("[", "(").replace("]", ")") +
                ", " + JSON.stringify(checkioInput[1]) + ')';

            var failError = function (dError) {
                $content.find('.call').html(checkioInputStr);
                $content.find('.output').html(dError.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
            };

            if (data.error) {
                failError(data.error);
                return false;
            }

            if (data.ext && data.ext.inspector_fail) {
                failError(data.ext.inspector_result_addon);
                return false;
            }

            $content.find('.call').html(checkioInputStr);
            $content.find('.output').html('Working...');

            var svg = new SVG($content.find(".explanation")[0]);
            svg.draw(checkioInput[0]);

            if (data.ext) {
                var userResult = data.out;
                var result = data.ext["result"];
                var result_addon = data.ext["result_addon"];
                var game_result = data.ext["game_result"];
                var bot_move = data.ext["bot_move"];

                var botMark = checkioInput[1] === "X" ? "O" : "X";

                svg.addMove(userResult, checkioInput[1]);
                if (bot_move) {
                    svg.addMove(bot_move, botMark);
                }

                //if you need additional info from tests (if exists)
                var explanation = data.ext["explanation"];
                $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));
                if (!result) {
                    $content.find('.answer').html(result_addon);
                    $content.find('.answer').addClass('error');
                    $content.find('.output').addClass('error');
                    $content.find('.call').addClass('error');
                }
                else if (game_result) {
                    if (game_result == "D") {
                        $content.find('.answer').html("Draw :-|");
                    }
                    else if (game_result == checkioInput[1]) {
                        $content.find('.answer').html("Win :-)");
                    }
                    else {
                        $content.find('.answer').remove();
                    }
                }
                else {
                    $content.find('.answer').remove();
                }
            }


            //Your code here about test explanation animation
            //$content.find(".explanation").html("Something text for example");
            //
            //
            //
            //
            //


            this_e.setAnimationHeight($content.height() + 60);

        });

        //This is for Tryit (but not necessary)
//        var $tryit;
//        ext.set_console_process_ret(function (this_e, ret) {
//            $tryit.find(".checkio-result").html("Result<br>" + ret);
//        });
//
//        ext.set_generate_animation_panel(function (this_e) {
//            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit'))).find('.tryit-content');
//            $tryit.find('.bn-check').click(function (e) {
//                e.preventDefault();
//                this_e.sendToConsoleCheckiO("something");
//            });
//        });

        function SVG(dom) {
            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            var pad = 10;

            var cell = 80;
            var size = cell * 3 + 2 * pad;

            var paper = Raphael(dom, size, size);

            var aLine = {"stroke": colorBlue4, "stroke-width": 4, "stroke-linecap": "round"};
            var aX = {"stroke": colorBlue3, "stroke-width": 4, "stroke-linecap": "round"};
            var aXb = {"stroke": colorBlue4, "stroke-width": 6, "stroke-linecap": "round"};
            var aO = {"stroke": colorOrange3, "stroke-width": 4};
            var aOb = {"stroke": colorOrange4, "stroke-width": 6};

            var field = [];

            function xPath(p, x, y) {
                var len = cell * 3 / 8;
                return p.path([
                    ["M", x - len, y - len],
                    ["L", x + len, y + len],
                    ["M", x - len, y + len],
                    ["L", x + len, y - len]
                ]);
            }

            function oPath(p, x, y) {
                return p.circle(x, y, cell * 3 / 8);
            }


            this.draw = function (grid) {
                for (var i = 0; i < 2; i++) {
                    paper.path([
                        ["M", pad, pad + cell * (i + 1)],
                        ["H", size - pad]
                    ]).attr(aLine);
                    paper.path([
                        ["M", pad + cell * (i + 1), pad],
                        ["V", size - pad]
                    ]).attr(aLine);
                }

                for (var row = 0; row < 3; row++) {
                    var temp = [];
                    for (var col = 0; col < 3; col++) {
                        var mark;
                        var xc = pad + (col + 0.5) * cell;
                        var yc = pad + (row + 0.5) * cell;
                        if (grid[row][col] == "X") {
                            xPath(paper, xc, yc).attr(aX);
                        }
                        else if (grid[row][col] == "O") {
                            oPath(paper, xc, yc).attr(aO);
                        }
                        temp.push(mark);
                    }
                    field.push(temp);
                }
            };

            this.addMove = function (coor, userMark) {
                try {
                    var xc = pad + (coor[1] + 0.5) * cell;
                    var yc = pad + (coor[0] + 0.5) * cell;
                    if (userMark == "X") {
                        xPath(paper, xc, yc).attr(aXb);
                    }
                    else {
                        oPath(paper, xc, yc).attr(aOb);
                    }

                }
                catch (e) {
                    console.log(e);
                }
            }


        }


    }
);
