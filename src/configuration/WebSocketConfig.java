package configuration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ApplicationScoped
@ServerEndpoint("/actions")
public class WebSocketConfig{
	
	
    private static Session sessionLocal;
    private static List<Session> sessionesMovil= new ArrayList<>();
    private static Map<Session, Integer> mapSesiones= new HashMap<Session, Integer>();
    private static int[] vikingoCruzadoNinja={-1,-1,-1};
    private static boolean[] muertos={false,false,false};
    public static boolean[] asesinados={false,false,false};
    public static boolean cerrandoJuego=false;
    
	@OnOpen
    public void open(Session session) {
		if(sessionLocal==null){
			cerrandoJuego=false;
			sessionLocal=session;
		}else{
			sessionesMovil.add(session);
			String charDisponibles="";
			for(int i=0;i<3;i++){
				if(vikingoCruzadoNinja[i]==-1 && !muertos[i] && !asesinados[i]){
					charDisponibles=charDisponibles+i+"-";
				}
			}
			try {
				if(!charDisponibles.equals("")){
					charDisponibles=charDisponibles.substring(0, charDisponibles.length()-1);
					session.getBasicRemote().sendText("initt"+charDisponibles);
				}else{
					session.getBasicRemote().sendText("gameo");
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	@OnClose
	    public void close(Session session) {
		try {
			if(session==sessionLocal){
				cerrandoJuego=true;
				for(Session mobileSessions: sessionesMovil){
					 if(mobileSessions.isOpen()){
						 mobileSessions.close();
					 }
				 }
				reiniciar();
			}else if(!cerrandoJuego){
				int index=sessionesMovil.indexOf(session);
				if(mapSesiones!=null){
					int posicion=mapSesiones.get(session);
					mapSesiones.remove(session);
					vikingoCruzadoNinja[posicion]=-1;
					sessionLocal.getBasicRemote().sendText("close"+posicion);
				}
				sessionesMovil.remove(index);
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@OnError
	    public void onError(Throwable error) {
	}
	
	@OnMessage
	    public void handleMessage(String message, Session session) {
		 try {
			 if(message.contains("char")){
				 int character= Integer.parseInt(message.charAt(4)+"");
				 vikingoCruzadoNinja[character]=sessionesMovil.indexOf(session);
				 mapSesiones.put(session, character);
				 sessionLocal.getBasicRemote().sendText("start"+character);
				 for(Session mobileSessions: sessionesMovil){
					 if(mobileSessions.isOpen()){
						 mobileSessions.getBasicRemote().sendText("block"+character);
					 }
				 }
			 }else if(message.contains("server")){
				 int character= Integer.parseInt(message.charAt(6)+"");
				 String prefix=message.substring(7,12);
				 if(character==7){
					 if(prefix=="winne"){
						 sessionLocal=null;
					 }
					 for(Session sesionActiva: sessionesMovil){
						 Integer indice=mapSesiones.get(sesionActiva);
						 if(vikingoCruzadoNinja[indice]!=-1 && !muertos[indice]){
							 sesionActiva.getBasicRemote().sendText(prefix);
						 }
					 }
					 
				 }else{
					 if(sessionesMovil.get(vikingoCruzadoNinja[character]).isOpen()){
						 sessionesMovil.get(vikingoCruzadoNinja[character]).getBasicRemote().sendText(message.toString().substring(7));
					 }
					 if(prefix.equals("killl")){
						 muertos[character]=true;
						 boolean gameOver=true;
						 for(int i=0; i<3; i++){
							 if(!muertos[i]){
								 gameOver=false; 
							 }
						 }
						 if(gameOver){
							 sessionLocal.getBasicRemote().sendText("gameover7");
						 }
						 
					 }
				 }
			}else{
				 sessionLocal.getBasicRemote().sendText(message.toString()+mapSesiones.get(session).toString());
			 }
	        } catch (Exception ex) {
	        	ex.printStackTrace();
	        }
	}

	private void reiniciar(){
		sessionLocal=null;
		sessionesMovil= new ArrayList<Session>();
		mapSesiones= new HashMap<Session, Integer>();
		vikingoCruzadoNinja[0]=-1;
		vikingoCruzadoNinja[1]=-1;
		vikingoCruzadoNinja[2]=-1;
	}

}
