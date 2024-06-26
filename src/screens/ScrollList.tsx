import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList, SearchStackParamList} from '../App';
import {Post} from '../lib/providers/types';
import {Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Skeleton} from 'moti/skeleton';
import {MotiView} from 'moti';
import useContentStore from '../lib/zustand/contentStore';
import {manifest} from '../lib/Manifest';

type Props = NativeStackScreenProps<HomeStackParamList, 'ScrollList'>;

const ScrollList = ({route}: Props): React.ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchStackParamList>>();
  const [posts, setPosts] = useState<Post[]>([]);
  const {filter} = route.params;
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const {provider} = useContentStore(state => state);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchPosts = async () => {
      setIsLoading(true);
      const newPosts = await manifest[
        route.params.providerValue || provider.value
      ].getPosts(filter, page, provider, signal);
      if (newPosts.length === 0) {
        setIsEnd(true);
        setIsLoading(false);
        return;
      }
      setPosts(prev => [...prev, ...newPosts]);
      setIsLoading(false);
    };
    fetchPosts();
  }, [page]);

  const onEndReached = async () => {
    if (isEnd) return;
    setIsLoading(true);
    setPage(page + 1);
  };

  return (
    <View className="h-full w-full bg-black items-center p-4">
      <View className="w-full px-4 font-semibold mt-5">
        <Text className="text-primary text-2xl font-bold">
          {route.params.title}
        </Text>
      </View>
      <View className="justify-center flex-row w-96 ">
        <FlatList
          ListFooterComponent={
            isLoading ? (
              <MotiView
                animate={{backgroundColor: 'black'}}
                //@ts-ignore
                transition={{
                  type: 'timing',
                }}
                className="flex flex-row gap-2 flex-wrap justify-center items-center">
                {[...Array(6)].map((_, i) => (
                  <View className="mx-3 gap-1 flex" key={i}>
                    <Skeleton
                      key={i}
                      show={true}
                      colorMode="dark"
                      height={150}
                      width={100}
                    />
                    <View className="h-1" />
                    <Skeleton
                      show={true}
                      colorMode="dark"
                      height={10}
                      width={100}
                    />
                  </View>
                ))}
              </MotiView>
            ) : null
          }
          data={posts}
          numColumns={3}
          contentContainerStyle={{
            width: 'auto',
            // flexDirection: 'row',
            // flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'flex-start',
          }}
          keyExtractor={(item, i) => item.title + i}
          renderItem={({item}) => (
            <View className="flex flex-col m-3">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Info', {
                    link: item.link,
                    provider: route.params.providerValue || provider.value,
                    poster: item?.image,
                  })
                }>
                <Image
                  className="rounded-md"
                  source={{
                    uri:
                      item.image ||
                      'https://placehold.jp/24/cccccc/ffffff/100x150.png?text=Img',
                  }}
                  style={{width: 100, height: 150}}
                />
              </TouchableOpacity>
              <Text className="text-white text-center truncate w-24 text-xs">
                {item.title.length > 24
                  ? item.title.slice(0, 24) + '...'
                  : item.title}
              </Text>
            </View>
          )}
          onEndReached={onEndReached}
        />
        {!isLoading && posts.length === 0 ? (
          <View className="w-full h-full flex items-center justify-center">
            <Text className="text-white text-center font-semibold text-lg">
              Not Found
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default ScrollList;
