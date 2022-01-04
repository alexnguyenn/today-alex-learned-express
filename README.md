## Express backend for [today-i-learned](https://github.com/alexnguyenn/today-i-learned)

Simple Express backend to process and send create post requests from 
[todayalexlearned.surge.sh](https://todayalexlearned.surge.sh/) to GraphCMS. It is deployed on Heroku. 

### Context

I was trying to implement a create post functionality on [todayalexlearned.surge.sh](https://todayalexlearned.surge.sh/) for funsies 
(even though I can just use GraphCMS content managing interface to do just that). There were a few problems:

* GraphCMS Content Public API should be read-only. Would be really bad if everyone on the Internet can just perform mutations on your
data.
* GraphCMS allows you to assign custom permissions via [PATs](https://graphcms.com/docs/api-reference/basics/authorization#permanent-auth-tokens). 
However it would be a bad idea to put it in the React client as it would be publicly visible. 

So I decided to create an Express backend with basic auth to submit mutation operations to GraphCMS with the PATs I generated from GraphCMS.
I did try out [Apollo Server](https://www.npmjs.com/package/apollo-server) with [apollo-datasource-graphql](https://www.npmjs.com/package/apollo-datasource-graphql) 
but ran into some troubles with processing rich text field. 

**Next step?** Maybe to scrap this and just use Next.js's API Routes :thinking:.
