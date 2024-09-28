import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "yuanshao00",
    name: "袁绍测试",
    sex: "male",
    org: "qun",
    hp: 4,
    intro: "字奉孝，颍川阳翟人，官至军师祭酒。惜天妒英才，英年早逝。有诗云：“良计环环不遗策，每临制变满座惊”。",
    voices: {
        die: "咳，咳……"
    },
    skills: {
        fangjian: {
            name: "放箭",
            info: "放箭",
            handle: {
                audio: "luanji",
                enable: "phaseUse",
                position: "hs",
                viewAs: { name: "wanjian" },
                filterCard(card, player) {
                    if (ui.selected.cards.length) {
                        return get.suit(card) == get.suit(ui.selected.cards[0]);
                    }
                    const cards = player.getCards("hs");
                    for (let i = 0; i < cards.length; i++) {
                        if (card != cards[i]) {
                            if (get.suit(card) == get.suit(cards[i])) return true;
                        }
                    }
                    return false;
                },
                selectCard: 2,
                complexCard: true,
                check(card) {
                    const player = _status.event.player;
                    const targets = game.filterPlayer(function (current) {
                        return player.canUse("wanjian", current);
                    });
                    let num = 0;
                    for (let i = 0; i < targets.length; i++) {
                        let eff = get.sgn(get.effect(targets[i], { name: "wanjian" }, player, player));
                        if (targets[i].hp == 1) {
                            eff *= 1.5;
                        }
                        num += eff;
                    }
                    if (!player.needsToDiscard(-1)) {
                        if (targets.length >= 7) {
                            if (num < 2) return 0;
                        } else if (targets.length >= 5) {
                            if (num < 1.5) return 0;
                        }
                    }
                    return 6 - get.value(card);
                },
                ai: {
                    basic: {
                        order: 8.5,
                    },
                },
            },
            xueyi: {
                trigger: { player: "phaseDiscardBefore" },
                audio: 2,
                audioname: ["re_yuanshao"],
                forced: true,
                firstDo: true,
                filter(event, player) {
                    return (
                        player.hasZhuSkill("xueyi") &&
                        game.hasPlayer(function (current) {
                            return current != player && current.group == "qun";
                        }) &&
                        player.countCards("h") > player.hp
                    );
                },
                async content() {},
                mod: {
                    maxHandcard(player, num) {
                        if (player.hasZhuSkill("xueyi")) {
                            return (
                                num +
                                game.countPlayer(function (current) {
                                    if (player != current && current.group == "qun") return 2;
                                })
                            );
                        }
                        return num;
                    },
                },
                zhuSkill: true,
            },
        },
        aaazhiman: {
            name: "制蛮",
            info: "制蛮",
            handle: {
                audio: "zhiman",
                trigger: { source: "damageBegin2" },
                filter: function (event, player) {
                    return player != event.player;
                },
                check: function (event, player) {
                    if (get.damageEffect(event.player, player, player) < 0) return true;
                    var att = get.attitude(player, event.player);
                    if (att > 0 && event.player.countCards("j")) return true;
                    if (event.num > 1) {
                        if (att < 0) return false;
                        if (att > 0) return true;
                    }
                    var cards = event.player.getGainableCards(player, "he");
                    for (var i = 0; i < cards.length; i++) {
                        if (get.equipValue(cards[i]) >= 6) return true;
                    }
                    return false;
                },
                logTarget: "player",
                content: function () {
                    if (trigger.player.countGainableCards(player, "hej")) {
                        player.gainPlayerCard(trigger.player, "hej", true);
                    }
                    trigger.cancel();
                },
            },
        }
    },
    perfectPairs: [],
}