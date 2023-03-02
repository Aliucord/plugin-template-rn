import { React, ReactNative, Forms } from 'aliucord/metro';

const { ScrollView } = ReactNative;
import { Settings } from "aliucord/api/Settings";
import { MoyaiSettings } from '.';

const { FormSection, FormInput, FormSwitch } = Forms;


// official implementation is broken
function useSettings<T>(settings: Settings<T>) {
    const [, update] = React.useState(0);
    return React.useMemo(() => ({
        get<K extends keyof T, V extends T[K]>(key: K, defaultValue: V) {
            return settings.get(key, defaultValue);
        },
        set<K extends keyof T, V extends T[K]>(key: K, value: V) {
            settings.set(key, value);
            update(x => x + 1);
        }
    }), []);
}

export default function page({_settings}: {_settings: Settings<MoyaiSettings>}) {
    const settings = useSettings(_settings);
    return (
      <FormSection title="Moyai">
        <FormSwitch
          title="Ignore bots"
          value={settings.get("ignoreBots", true)}
          onValueChange={(v) => {
                 console.log("ignoreBots", v);
                 settings.set("ignoreBots", v)
          }} />
      </FormSection>
  )
}
