import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "20241007_maliang_plus",
    name: "法师马良",
    sex: "male",
    org: "shu",
    hp: 4,
    intro: "应援自己马良",
    image: "maliang.jpg",
    skills: {
        yingyuan: {
            name: "应援",
            info: "应援",
            handle: {
                audio: 2,
                trigger: { player: "useCardAfter" },
                direct: true,
                filter: function (event, player) {
                    if (_status.currentPhase != player) return false;
                    if (
                        player.getHistory("custom", function (evt) {
                            return evt.yingyuan_name == event.card.name;
                        }).length > 0
                    )
                        return false;
                    return event.cards.filterInD().length > 0;
                },
                content: function () {
                    "step 0";
                    player
                        .chooseTarget(get.prompt("yingyuan"), "将" + get.translation(trigger.cards) + "交给一名其他角色", function (card, player, target) {
                            return true;
                        })
                        .set("ai", function (target) {
                            if (target.hasJudge("lebu")) return 0;
                            let att = get.attitude(_status.event.player, target),
                                name = _status.event.cards[0].name;
                            if (att < 3) return 0;
                            if (target.hasSkillTag("nogain")) att /= 10;
                            if (name === "sha" && target.hasSha()) att /= 5;
                            if (name === "wuxie" && target.needsToDiscard(_status.event.cards)) att /= 5;
                            return att / (1 + get.distance(player, target, "absolute"));
                        })
                        .set("cards", trigger.cards);
                    "step 1";
                    if (result.bool) {
                        player.logSkill("yingyuan", result.targets[0]);
                        result.targets[0].gain(trigger.cards.filterInD(), "gain2");
                        player.getHistory("custom").push({ yingyuan_name: trigger.card.name });
                    }
                },
            },
        },
        zishu: {
            name: "自书",
            info: "自书",
            handle: {
                audio: 2,
                locked: true,
                subSkill: {
                    discard: {
                        trigger: { global: "phaseEnd" },
                        audio: "zishu",
                        forced: true,
                        filter: function (event, player) {
                            if (_status.currentPhase != player) {
                                var he = player.getCards("h");
                                var bool = false;
                                player.getHistory("gain", function (evt) {
                                    if (!bool && evt && evt.cards) {
                                        for (var i = 0; i < evt.cards.length; i++) {
                                            if (he.includes(evt.cards[i])) bool = true;
                                            break;
                                        }
                                    }
                                });
                                return bool;
                            }
                            return false;
                        },
                        content: function () {
                            var he = player.getCards("h");
                            var list = [];
                            player.getHistory("gain", function (evt) {
                                if (evt && evt.cards) {
                                    for (var i = 0; i < evt.cards.length; i++) {
                                        if (he.includes(evt.cards[i])) list.add(evt.cards[i]);
                                    }
                                }
                            });
                            player.$throw(list, 1000);
                            player.lose(list, ui.discardPile, "visible");
                            game.log(player, "将", list, "置入弃牌堆");
                        },
                    },
                    mark: {
                        trigger: {
                            player: "gainBegin",
                            global: "phaseBeginStart",
                        },
                        silent: true,
                        filter: function (event, player) {
                            return event.name != "gain" || player != _status.currentPhase;
                        },
                        content: function () {
                            if (trigger.name == "gain") trigger.gaintag.add("zishu");
                            else player.removeGaintag("zishu");
                        },
                    },
                    draw: {
                        trigger: {
                            player: "gainAfter",
                            global: "loseAsyncAfter",
                        },
                        audio: "zishu",
                        forced: true,
                        filter: function (event, player) {
                            if (_status.currentPhase != player || event.getg(player).length == 0) return false;
                            return event.getParent(2).name != "zishu_draw";
                        },
                        content: function () {
                            player.draw("nodelay");
                        },
                    },
                },
                ai: {
                    threaten: 1.2,
                    nogain: 1,
                    skillTagFilter: function (player) {
                        return player != _status.currentPhase;
                    },
                },
                group: ["zishu_draw", "zishu_discard", "zishu_mark"],
            },
        },
    },
    perfectPairs: [],
}