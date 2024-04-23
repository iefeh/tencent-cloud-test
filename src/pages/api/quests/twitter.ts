import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import {v4 as uuidv4} from "uuid";
import TwitterTopic from "@/lib/models/TwitterTopic";
import doTransaction from "@/lib/mongodb/transaction";
import { QuestType } from "@/lib/quests/types";
const router = createRouter<UserContextRequest, NextApiResponse>();

const tempToken = "cb114af7-9086-4a0d-98fe-b63b70e896ac";

router.use(maybeAuthInterceptor).post(async (req, res) => {
    const {token} = req.query;
    if (token !== tempToken) {
        res.json(response.notFound());
        return;
    }
    // twitter_type必须为"tweet_interaction"或者"twitter_topic"
    const {twitter_type} = req.body;
    switch (twitter_type) {
        case "tweet_interaction":
            await createTwitterInteractionQuest(req, res);
            break;
        case "twitter_topic":
            await createTwitterTopicQuest(req, res);
            break;
        default:
            res.json(response.notFound());
            return;
    }
    res.json(response.success({}));
});

async function createTwitterInteractionQuest(req: any, res: any) {
    const {must_contains_text,hash_tags,mention_usernames,reply_to_tweet_id,start_time,end_time,delay_seconds} = req.body;
    var commentUrl = `https://twitter.com/intent/tweet?in_reply_to=${reply_to_tweet_id}`;
    let hasAndOperator = false;
    if (mention_usernames && mention_usernames.length > 0) {
        let mentions = "";
        for (let username of mention_usernames) {
            mentions += `@${username}%20`;
        }
        hasAndOperator = true;
        commentUrl += `&text=${mentions}`;
    }
    if (must_contains_text) {
        // 把文本的\n替换为%0a
        const text = must_contains_text.replace(/\n/g, "%0a");
        commentUrl += hasAndOperator? `${text}%20` : `&text=${text}`;
    }
    if (hash_tags && hash_tags.length > 0) {
        const tags = hash_tags.join(",");
        commentUrl += `&hashtags=${tags}`;
    }
    const topicId = uuidv4();
    const topic = new TwitterTopic({
        id: topicId,
        hash_tags: hash_tags,
        must_contains_text: must_contains_text,
        mention_usernames: mention_usernames,
        reply_to_tweet_id: reply_to_tweet_id,
        start_time: start_time,
        end_time: end_time,
        delay_seconds: delay_seconds,
        retweet_excluded: false,
        reply_excluded: false,
        quote_excluded: false,
        synced: false,
        active: false,
    }); 
    const quest = new Quest({
        id: uuidv4(),
        name: "Tweet Interaction Quest",
        category: "8a320647-85a5-4c84-863a-8904bb98fe2f", // 社区互动类任务
        tag: "03bb3b9c-9bc9-445d-9eed-c5b80d1c07e6", // twitter类任务
        description: "Tweet Interaction Quest",
        type: QuestType.TweetInteraction,
        properties: {
            topic_id: topicId,
            tweet_url: "",
            tweet_id: reply_to_tweet_id,
            url: commentUrl,
        },
        reward: {
            type: "fixed",
            amount: 10,
            amount_formatted: 10,
            season_pass_progress: 1,
        },
        active: false,
        order: 1,
        start_time: start_time,
        end_time: end_time,
        created_time: Date.now(),
        updated_time: Date.now(),
    });

    await doTransaction(async (session) => {
        await topic.save({session});
        await quest.save({session});
    });
}

async function createTwitterTopicQuest(req: any, res: any) {
    const {must_contains_text,hash_tags,mention_usernames,reply_to_tweet_id,start_time,end_time,delay_seconds,retweet_excluded,reply_excluded,quote_excluded} = req.body;
    
    var postUrl = "https://twitter.com/intent/post?";
    let hasAndOperator = false;
    if (mention_usernames && mention_usernames.length > 0) {
        let mentions = "";
        for (let username of mention_usernames) {
            mentions += `@${username}%20`;
        }
        hasAndOperator = true;
        postUrl += `&text=${mentions}`;
    }
    if (must_contains_text) {
        // 把文本的\n替换为%0a
        const text = must_contains_text.replace(/\n/g, "%0a");
        postUrl += hasAndOperator? `${text}%20` : `&text=${text}%20`;
    }
    if (hash_tags && hash_tags.length > 0) {
        const tags = hash_tags.join(",");
        postUrl += `&hashtags=${tags}`;
    }
    const topicId = uuidv4();
    const topic = new TwitterTopic({
        id: topicId,
        hash_tags: hash_tags,
        must_contains_text: must_contains_text,
        mention_usernames: mention_usernames,
        reply_to_tweet_id: reply_to_tweet_id,
        start_time: start_time,
        end_time: end_time,
        delay_seconds: delay_seconds,
        retweet_excluded: retweet_excluded,
        // 不能设置为true，twitter默认把原始推文归类为reply类型.
        reply_excluded: false, 
        quote_excluded: quote_excluded,
        synced: false,
        active: false,
    }); 
    const quest = new Quest({
        id: uuidv4(),
        name: "Twitter Topic Quest",
        category: "8a320647-85a5-4c84-863a-8904bb98fe2f", // twitter类任务
        tag: "03bb3b9c-9bc9-445d-9eed-c5b80d1c07e6",
        description: "Twitter Topic Quest",
        type: QuestType.TwitterTopic,
        properties: {
            topic_id: topicId,
            url: postUrl,
        },
        reward: {
            type: "fixed",
            amount: 10,
            amount_formatted: 10,
            season_pass_progress: 1,
        },
        active: false,
        order: 1,
        start_time: start_time,
        end_time: end_time,
        created_time: Date.now(),
        updated_time: Date.now(),
    });

    await doTransaction(async (session) => {
        await topic.save({session});
        await quest.save({session});
    });
}

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});