import { Button } from "@/components/ui/Button";
import { BAND_OVERLAP, MonoTag, ScreenBand } from "@/components/ui/ScreenBand";
import { termColor } from "@/components/ui/SwipeCard";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { theme } from "@/constants/designTheme";
import { USE_MOCK_DATA } from "@/constants/devConfig";
import { MOCK_TERMS } from "@/constants/mockTerms";
import { useAuth } from "@/context/AuthContext";
import {
  TAB_BAR_CLEARANCE,
  useHideTabBarOnScroll,
} from "@/context/TabBarContext";
import { getSavedTerms, removeSavedTerm } from "@/services/savedTerms";
import type { SlangTerm } from "@/types/slangTerm";
import { showAlert } from "@/utils/alert";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { DeviceMobile, Trash } from "phosphor-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { styles } from "@/styles/tabs/saved.styles";

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const onScroll = useHideTabBarOnScroll();
  const [terms, setTerms] = useState<SlangTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reload every time the tab comes into view, so a word saved on the Feed
  // a moment ago is already here (the old one-off load went stale).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const source = USE_MOCK_DATA
        ? Promise.resolve(MOCK_TERMS)
        : user
          ? getSavedTerms(user.uid)
          : Promise.resolve([]);
      source.then((loaded) => {
        if (cancelled) return;
        setTerms(loaded);
        setIsLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [user]),
  );

  function handleRemove(termId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTerms((prev) => prev.filter((t) => t.id !== termId));
    if (!USE_MOCK_DATA && user) {
      removeSavedTerm(user.uid, termId).catch((error) =>
        console.log("Remove term error:", error),
      );
    }
  }

  function handleOpen(termId: string) {
    router.push({ pathname: "/learn", params: { startId: termId } });
  }

  function handleStudyAll() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/learn");
  }

  function confirmRemove(term: SlangTerm) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert(
      "Remove from saved?",
      `"${term.term}" will be removed from your dictionary.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => handleRemove(term.id),
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <ScreenBand
        title="My dictionary"
        subtitle={
          terms.length > 0
            ? `${terms.length} ${terms.length === 1 ? "word" : "words"} saved`
            : "Everything you save from the Feed lands here."
        }
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: theme.spacing.xl }}
        />
      ) : terms.length === 0 ? (
        <Card style={[styles.emptyCard, styles.body]}>
          <Text variant="heading" style={{ marginBottom: 8 }}>
            Nothing saved yet
          </Text>
          <Text variant="muted">
            Swipe right on a term in the Feed to add it here.
          </Text>
        </Card>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.body,
            { paddingBottom: TAB_BAR_CLEARANCE },
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <Card style={styles.studyCard}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.studyTitle}>Dictionary mode</Text>
              <View style={styles.studyHintRow}>
                {Platform.OS !== "web" ? (
                  <DeviceMobile
                    size={16}
                    color={theme.colors.inkSoft}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                ) : null}
                <Text variant="muted" style={styles.studyHint}>
                  {Platform.OS === "web"
                    ? "Flashcards, one word at a time."
                    : "Opens sideways. Turn your phone to study."}
                </Text>
              </View>
            </View>
            <Button
              label="Study all"
              variant="primary"
              size="compact"
              onPress={handleStudyAll}
              style={{ marginBottom: 0 }}
            />
          </Card>
          <Text variant="muted" style={styles.listHint}>
            Tap a word to study it. Hold to remove it.
          </Text>
          {terms.map((term) => (
            <Animated.View
              key={term.id}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout.springify()}
            >
              <Pressable
                onPress={() => handleOpen(term.id)}
                onLongPress={() => confirmRemove(term)}
              >
                <Card style={styles.termCard}>
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.spine,
                        { backgroundColor: termColor(term.id) },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.termText}>{term.term}</Text>
                      <MonoTag>{term.language}</MonoTag>
                    </View>
                    <Pressable
                      onPress={() => confirmRemove(term)}
                      hitSlop={10}
                      style={styles.removeButton}
                    >
                      <Trash size={20} color={theme.colors.protea} />
                    </Pressable>
                  </View>
                </Card>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
