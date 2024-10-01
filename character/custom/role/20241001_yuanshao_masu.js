import { lib, game, ui, get, ai, _status } from "../../../noname.js";

export default {
    code: "20241001_yuanshao_masu",
    name: "乱击制蛮袁绍",
    sex: "male",
    org: "qun",
    hp: 4,
    intro: "乱击+制蛮",
    image: "re_yuanshao.jpg",
    skills: {
        luanji: {
            name: "乱击",
            info: "出牌阶段，你可以将任意两张相同花色的手牌当做【万箭齐发】使用。",
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
        },
        zhiman: {
            name: "制蛮",
            info: "当你对一名其他角色造成伤害时，你可以防止此伤害，然后获得其区域内的一张牌。",
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