const USERNAME = "nuevaacropolisdominicana";
const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`;
const wrapped = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

const res = await fetch(wrapped);
const text = await res.text();
console.log("status", res.status, "len", text.length);
console.log(text.slice(0, 500));

try {
  const data = JSON.parse(text);
  const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges;
  console.log("edges", edges?.length);
} catch (e) {
  console.log("parse err", e.message);
}

// GraphQL approach with doc_id known for user posts
const DOC_ID = "795027684086996233049719253485"; // PolarisProfilePostsTabContentQuery - may be outdated
const variables = JSON.stringify({ id: "", username: USERNAME, first: 12 });
const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=${DOC_ID}&variables=${encodeURIComponent(variables)}`;
const gqlRes = await fetch(gqlUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0",
    "X-IG-App-ID": "936619743392459",
  },
});
const gqlText = await gqlRes.text();
console.log("\ngql", gqlRes.status, gqlText.slice(0, 400));
